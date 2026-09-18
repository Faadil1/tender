import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MemorySettlementRepository } from "../adapters/memoryRepository.js";
import { KeeperHubExecutor } from "../adapters/keeperhub.js";
import { acceptanceFromGitHubPullRequestEvent, contributionFromIssueMetadata, verifyGitHubSignature } from "../adapters/github.js";
import { SettlementEngine } from "../domain/settlementEngine.js";
import { demoAcceptance, demoContribution } from "./demoData.js";

const repo = new MemorySettlementRepository();
const executor = new KeeperHubExecutor({
  apiKey: process.env.KEEPERHUB_API_KEY,
  workflowId: process.env.KEEPERHUB_WORKFLOW_ID,
  baseUrl: process.env.KEEPERHUB_BASE_URL,
  mode: process.env.KEEPERHUB_MODE === "workflow" ? "workflow" : "mock"
});
const engine = new SettlementEngine(repo, executor, {
  version: "policy.demo.v1",
  token: "USDC",
  chainId: 84532,
  maxAmount: process.env.TENDER_MAX_AMOUNT_USDC ?? "5",
  requireReview: false
});

const publicDir = join(fileURLToPath(new URL("../../public", import.meta.url)));

function json(res: any, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
}

async function readBody(req: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function handleApi(req: any, res: any, path: string) {
  if (req.method === "GET" && path === "/api/settlements") {
    return json(res, 200, { records: await repo.all() });
  }

  if (req.method === "POST" && path === "/api/demo/reset") {
    const fresh = await engine.handleAcceptance(demoContribution, demoAcceptance({ accepted: false, merged: false }));
    return json(res, 200, { record: fresh });
  }

  if (req.method === "POST" && path === "/api/demo/merge") {
    const record = await engine.handleAcceptance(demoContribution, demoAcceptance());
    return json(res, 200, { record });
  }

  if (req.method === "POST" && path === "/api/demo/replay") {
    const record = await engine.handleAcceptance(demoContribution, demoAcceptance({ eventId: "evt_demo_merge_replayed", action: "replayed" }));
    return json(res, 200, { record });
  }

  if (req.method === "POST" && path === "/api/demo/checks-failing") {
    const record = await engine.handleAcceptance(demoContribution, demoAcceptance({ requiredChecksPassed: false }));
    return json(res, 200, { record });
  }

  if (req.method === "POST" && path === "/api/demo/invalid-wallet") {
    const record = await engine.handleAcceptance({ ...demoContribution, recipientWallet: "not-a-wallet" }, demoAcceptance());
    return json(res, 200, { record });
  }

  if (req.method === "POST" && path === "/api/github/webhook") {
    const body = await readBody(req);
    const verified = verifyGitHubSignature(
      process.env.GITHUB_WEBHOOK_SECRET ?? "",
      body,
      req.headers["x-hub-signature-256"]
    );
    const payload = JSON.parse(body);
    const acceptance = acceptanceFromGitHubPullRequestEvent(
      req.headers["x-github-delivery"] ?? "missing",
      payload,
      verified,
      payload.tender_required_checks_passed === true
    );
    const contribution = contributionFromIssueMetadata({
      repository: acceptance.repository,
      issueId: acceptance.issueId,
      pullRequestId: acceptance.pullRequestId,
      contributor: payload.pull_request?.user?.login ?? "unknown",
      recipientWallet: payload.tender_recipient_wallet,
      amount: payload.tender_amount_usdc ?? "0",
      token: "USDC",
      chainId: 84532
    });
    const record = await engine.handleAcceptance(contribution, acceptance);
    return json(res, 200, { record });
  }

  return json(res, 404, { error: "not_found" });
}

const APP_ROUTES = new Set(["/", "/obligation", "/proof", "/lab", "/receipt"]);

async function serveStatic(res: any, path: string) {
  const file = APP_ROUTES.has(path) ? "index.html" : path.slice(1);
  const full = join(publicDir, file);
  try {
    const body = await readFile(full);
    const type = extname(full) === ".css" ? "text/css" : extname(full) === ".js" ? "text/javascript" : "text/html";
    res.writeHead(200, { "Content-Type": type });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname.startsWith("/api/")) return handleApi(req, res, url.pathname);
  return serveStatic(res, url.pathname);
});

const port = Number(process.env.PORT ?? 8787);
server.listen(port, () => {
  console.log(`Tender listening on http://localhost:${port}`);
});
