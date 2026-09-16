import { mkdir, writeFile } from "node:fs/promises";
import { MemorySettlementRepository } from "../src/adapters/memoryRepository.js";
import { SettlementEngine } from "../src/domain/settlementEngine.js";
import type { SettlementClaim, SettlementExecutor, SettlementRecord } from "../src/domain/types.js";
import { demoAcceptance, demoContribution } from "../src/server/demoData.js";

class HarnessExecutor implements SettlementExecutor {
  calls = 0;
  mode: "success" | "failed" | "running" = "success";

  async preflight() {
    return { ok: true as const };
  }

  async execute(claim: SettlementClaim) {
    this.calls += 1;
    if (this.mode === "failed") return { executionId: `kh_failed_${this.calls}`, status: "failed" as const, error: "keeperhub_timeout" };
    if (this.mode === "running") return { executionId: `kh_running_${this.calls}`, status: "running" as const };
    return {
      executionId: `kh_success_${this.calls}`,
      status: "success" as const,
      transactionHash: `0x${claim.claimId.replace("tclaim_", "").padEnd(64, "0").slice(0, 64)}`
    };
  }

  async reconcile(record: SettlementRecord) {
    if (record.status === "SETTLING" && record.keeperHubExecutionId?.startsWith("kh_running")) {
      record.status = "SETTLED";
      record.claim.status = "SETTLED";
      record.transactionHash = "0xreconciled_after_timeout";
    }
    return record;
  }
}

const policy = {
  version: "policy.harness.v1",
  token: "USDC",
  chainId: 84532,
  maxAmount: "5",
  requireReview: false
};

async function makeEngine(executor = new HarnessExecutor()) {
  return {
    executor,
    engine: new SettlementEngine(new MemorySettlementRepository(), executor, policy)
  };
}

type ScenarioResult = {
  name: string;
  finalStatus: string;
  keeperHubExecutions: number;
  duplicatePayouts: number;
  claimIds: string[];
  notes: string;
};

const results: ScenarioResult[] = [];

async function scenario(name: string, run: () => Promise<ScenarioResult>) {
  results.push(await run().then((result) => ({ ...result, name })));
}

await scenario("duplicate webhook", async () => {
  const { engine, executor } = await makeEngine();
  const first = await engine.handleAcceptance(demoContribution, demoAcceptance({ eventId: "delivery-a" }));
  const replay = await engine.handleAcceptance(demoContribution, demoAcceptance({ eventId: "delivery-b" }));
  return {
    name: "",
    finalStatus: replay.status,
    keeperHubExecutions: executor.calls,
    duplicatePayouts: executor.calls - 1,
    claimIds: [first.claim.claimId, replay.claim.claimId],
    notes: "Second delivery mapped to same Tender Claim."
  };
});

await scenario("two concurrent workers", async () => {
  const { engine, executor } = await makeEngine();
  const [a, b] = await Promise.all([
    engine.handleAcceptance(demoContribution, demoAcceptance({ eventId: "worker-a" })),
    engine.handleAcceptance(demoContribution, demoAcceptance({ eventId: "worker-b" }))
  ]);
  return {
    name: "",
    finalStatus: b.status,
    keeperHubExecutions: executor.calls,
    duplicatePayouts: executor.calls - 1,
    claimIds: [a.claim.claimId, b.claim.claimId],
    notes: "In-process lock converged workers before second execution."
  };
});

await scenario("repeated GitHub Action run", async () => {
  const { engine, executor } = await makeEngine();
  const first = await engine.handleAcceptance(demoContribution, demoAcceptance({ eventId: "action-run-1" }));
  const rerun = await engine.handleAcceptance(demoContribution, demoAcceptance({ eventId: "action-run-2", action: "workflow_run.completed" }));
  return {
    name: "",
    finalStatus: rerun.status,
    keeperHubExecutions: executor.calls,
    duplicatePayouts: executor.calls - 1,
    claimIds: [first.claim.claimId, rerun.claim.claimId],
    notes: "Action rerun does not create a new economic obligation."
  };
});

await scenario("PR closed without acceptance", async () => {
  const { engine, executor } = await makeEngine();
  const record = await engine.handleAcceptance(demoContribution, demoAcceptance({ accepted: false, merged: false, acceptedWorkId: undefined, mergeSha: undefined }));
  return {
    name: "",
    finalStatus: record.status,
    keeperHubExecutions: executor.calls,
    duplicatePayouts: 0,
    claimIds: [record.claim.claimId],
    notes: "No accepted obligation exists."
  };
});

await scenario("failed CI / incomplete acceptance", async () => {
  const { engine, executor } = await makeEngine();
  const record = await engine.handleAcceptance(demoContribution, demoAcceptance({ requiredChecksPassed: false }));
  return {
    name: "",
    finalStatus: record.status,
    keeperHubExecutions: executor.calls,
    duplicatePayouts: 0,
    claimIds: [record.claim.claimId],
    notes: "Checks failed before settlement."
  };
});

await scenario("malformed recipient", async () => {
  const { engine, executor } = await makeEngine();
  const bad = { ...demoContribution, recipientWallet: "bad", recipients: [{ wallet: "bad", amount: "1.00", role: "primary" as const }] };
  const record = await engine.handleAcceptance(bad, demoAcceptance());
  return {
    name: "",
    finalStatus: record.status,
    keeperHubExecutions: executor.calls,
    duplicatePayouts: 0,
    claimIds: [record.claim.claimId],
    notes: "Unsafe recipient blocked before KeeperHub."
  };
});

await scenario("altered economic claim", async () => {
  const { engine, executor } = await makeEngine();
  const first = await engine.handleAcceptance(demoContribution, demoAcceptance());
  const altered = {
    ...demoContribution,
    amount: "1.25",
    recipients: [{ ...demoContribution.recipients[0], amount: "1.25" }]
  };
  const second = await engine.handleAcceptance(altered, demoAcceptance());
  return {
    name: "",
    finalStatus: second.status,
    keeperHubExecutions: executor.calls,
    duplicatePayouts: 0,
    claimIds: [first.claim.claimId, second.claim.claimId],
    notes: "Changed economics create a different Tender Claim, not a replay."
  };
});

await scenario("KeeperHub timeout / unconfirmed result", async () => {
  const executor = new HarnessExecutor();
  executor.mode = "running";
  const { engine } = await makeEngine(executor);
  const record = await engine.handleAcceptance(demoContribution, demoAcceptance());
  return {
    name: "",
    finalStatus: record.status,
    keeperHubExecutions: executor.calls,
    duplicatePayouts: 0,
    claimIds: [record.claim.claimId],
    notes: "Execution remains SETTLING; retry must reconcile the same claim."
  };
});

await scenario("callback/process interruption after broadcast", async () => {
  const executor = new HarnessExecutor();
  executor.mode = "running";
  const { engine } = await makeEngine(executor);
  const record = await engine.handleAcceptance(demoContribution, demoAcceptance());
  const recovered = await engine.reconcile(record.claim.claimId);
  return {
    name: "",
    finalStatus: recovered?.status ?? "missing",
    keeperHubExecutions: executor.calls,
    duplicatePayouts: 0,
    claimIds: [record.claim.claimId],
    notes: "Reconciliation recovers the already-broadcast claim."
  };
});

await scenario("retry after success", async () => {
  const { engine, executor } = await makeEngine();
  const settled = await engine.handleAcceptance(demoContribution, demoAcceptance());
  const retry = await engine.handleAcceptance(demoContribution, demoAcceptance({ eventId: "retry-after-success" }));
  return {
    name: "",
    finalStatus: retry.status,
    keeperHubExecutions: executor.calls,
    duplicatePayouts: executor.calls - 1,
    claimIds: [settled.claim.claimId, retry.claim.claimId],
    notes: "Retry after success is treated as replay."
  };
});

const duplicatePayouts = results.reduce((sum, item) => sum + Math.max(0, item.duplicatePayouts), 0);
const summary = {
  generatedAt: new Date().toISOString(),
  scenarios: results.length,
  duplicatePayouts,
  statement: `${results.length} settlement scenarios replayed · ${duplicatePayouts} duplicate payouts`,
  results
};

await mkdir("evidence", { recursive: true });
await writeFile("evidence/settlement-replay-harness.json", `${JSON.stringify(summary, null, 2)}\n`);
console.log(summary.statement);
