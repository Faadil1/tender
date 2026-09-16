import type { SettlementClaim, SettlementExecutor, SettlementRecord } from "../domain/types.js";

interface KeeperHubOptions {
  apiKey?: string;
  workflowId?: string;
  baseUrl?: string;
  mode?: "mock" | "workflow";
}

export class KeeperHubExecutor implements SettlementExecutor {
  private readonly baseUrl: string;
  private readonly mode: "mock" | "workflow";

  constructor(private readonly options: KeeperHubOptions) {
    this.baseUrl = options.baseUrl ?? "https://app.keeperhub.com";
    this.mode = options.mode ?? (options.apiKey && options.workflowId ? "workflow" : "mock");
  }

  async preflight(claim: SettlementClaim) {
    if (this.mode === "mock") return { ok: true as const };
    if (!this.options.apiKey || !this.options.workflowId) return { ok: false as const, error: "keeperhub_not_configured" };

    const res = await fetch(`${this.baseUrl}/api/keys`, {
      headers: { Authorization: `Bearer ${this.options.apiKey}` }
    });
    if (!res.ok) return { ok: false as const, error: `keeperhub_auth_failed_${res.status}` };
    if (Number(claim.contribution.amount) <= 0) return { ok: false as const, error: "invalid_amount" };
    return { ok: true as const };
  }

  async execute(claim: SettlementClaim) {
    if (this.mode === "mock") {
      return {
        executionId: `kh_mock_${claim.settlementId.slice(-10)}`,
        transactionHash: `0x${claim.settlementId.replace("tender_", "").padEnd(64, "0").slice(0, 64)}`,
        status: "success" as const
      };
    }

    const res = await fetch(`${this.baseUrl}/api/workflows/${this.options.workflowId}/execute`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": claim.idempotencyKey
      },
      body: JSON.stringify({
        settlementId: claim.settlementId,
        recipient: claim.contribution.recipientWallet,
        token: claim.contribution.token,
        chainId: claim.contribution.chainId,
        amount: claim.contribution.amount,
        source: claim.contribution.repository,
        mergeSha: claim.acceptance.mergeSha
      })
    });

    if (!res.ok) {
      return { executionId: `failed_${Date.now()}`, status: "failed" as const, error: `keeperhub_execute_${res.status}` };
    }

    const data = (await res.json()) as { executionId: string; status: "running" };
    const result = await this.wait(data.executionId);
    return result;
  }

  async reconcile(record: SettlementRecord) {
    if (record.status === "SETTLED" || this.mode === "mock" || !record.keeperHubExecutionId) return record;
    const result = await this.wait(record.keeperHubExecutionId);
    if (result.status === "success" && result.transactionHash) {
      record.status = "SETTLED";
      record.transactionHash = result.transactionHash;
      record.updatedAt = new Date().toISOString();
    }
    return record;
  }

  private async wait(executionId: string) {
    const res = await fetch(`${this.baseUrl}/api/workflows/executions/${executionId}/wait?timeoutMs=55000`, {
      headers: { Authorization: `Bearer ${this.options.apiKey}` }
    });
    if (!res.ok) return { executionId, status: "failed" as const, error: `keeperhub_wait_${res.status}` };
    const data = (await res.json()) as {
      completed: boolean;
      status: string;
      error?: string;
      transactionHashes?: Array<{ hash: string }>;
    };
    if (!data.completed) return { executionId, status: "running" as const };
    if (data.status !== "success") return { executionId, status: "failed" as const, error: data.error ?? data.status };
    return { executionId, status: "success" as const, transactionHash: data.transactionHashes?.[0]?.hash };
  }
}
