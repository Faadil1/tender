const $ = (selector) => document.querySelector(selector);

const statusEl = $("#status");
const stampEl = $("#stamp");
const acceptanceFactsEl = $("#acceptance-facts");
const claimFactsEl = $("#claim-facts");
const receiptFactsEl = $("#receipt-facts");
const timelineEl = $("#timeline");
const proofEl = $("#proof");
const replayPanel = $("#replay-panel");
const replayButton = $("#replay-button");
const chainButton = $("#chain-button");
const chainPanel = $("#chain-panel");
const chainProofEl = $("#chain-proof");
const inspectorForm = $("#claim-inspector");
const inspectButton = $("#inspect-button");
const verificationResult = $("#verification-result");
const txLink = $("#tx-link");
const runtimeMode = $("#runtime-mode");

const short = (value, left = 10, right = 8) => {
  if (!value || value.length <= left + right + 1) return value ?? "—";
  return `${value.slice(0, left)}…${value.slice(-right)}`;
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const row = (key, value, full = value) => `<dt>${escapeHtml(key)}</dt><dd title="${escapeHtml(full)}">${escapeHtml(value)}</dd>`;

const getJson = async (url, init = {}) => {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body?.message ?? `${url} failed (${response.status})`);
  return body;
};

const [runtime, proof, packet] = await Promise.all([
  getJson("/api/runtime"),
  getJson("/api/proof"),
  getJson("/api/acceptance-packet")
]);

runtimeMode.textContent = runtime.runtime === "cloudflare-worker" ? "LIVE CLEARING RUNTIME" : "RUNTIME UNKNOWN";
runtimeMode.title = `Server evaluated ${runtime.serverTime}`;

const receipt = proof.settlement.receipt;
const claim = proof.tenderClaim;
const replay = proof.replay;

$("#amount").textContent = `${receipt.amount} ${receipt.asset}`;
$("#same-claim").textContent = replay.sameClaim ? "TRUE" : "FALSE";
$("#extra-executions").textContent = String(replay.additionalKeeperHubExecutions);
$("#extra-movement").textContent = replay.additionalMovement;
$("#proof-time").textContent = `Proof ${new Date(proof.generatedAt).toISOString().slice(0, 10)}`;
txLink.href = proof.settlement.explorerUrl;

acceptanceFactsEl.innerHTML = [
  row("Source", receipt.acceptanceEvidence.source.toUpperCase()),
  row("Acceptance", receipt.acceptanceEvidence.acceptanceKind.replaceAll("_", " ")),
  row("Accepted work", short(packet.acceptedWorkId, 12, 10), packet.acceptedWorkId),
  row("Evidence event", receipt.acceptanceEvidence.eventId, receipt.acceptanceEvidence.eventId),
  row("Policy", packet.settlementPolicy.version, packet.settlementPolicy.version),
  row("Rule", "Policy precedes acceptance")
].join("");

claimFactsEl.innerHTML = [
  row("Claim ID", claim.claimId, claim.claimId),
  row("Accepted work", short(proof.contribution.acceptedWorkId, 12, 10), proof.contribution.acceptedWorkId),
  row("Policy", claim.policyVersion, claim.policyVersion),
  row("Recipient", short(receipt.recipients[0].wallet), receipt.recipients[0].wallet),
  row("Value", `${receipt.amount} ${receipt.asset}`),
  row("Idempotency", short(claim.idempotencyKey, 18, 10), claim.idempotencyKey)
].join("");

receiptFactsEl.innerHTML = [
  row("Receipt", receipt.receiptId, receipt.receiptId),
  row("KeeperHub execution", proof.keeperHub.executionId, proof.keeperHub.executionId),
  row("Transaction", short(proof.settlement.transactionHash, 14, 12), proof.settlement.transactionHash),
  row("Network", "Base Sepolia · 84532"),
  row("Settlement", proof.settlement.status),
  row("Settled at", new Date(receipt.settledAt).toISOString().replace("T", " ").replace(".000Z", "Z"))
].join("");

$("#inspect-amount").value = receipt.amount;
$("#inspect-recipient").value = receipt.recipients[0].wallet;
$("#inspect-policy").value = claim.policyVersion;

const timeline = [
  ["POLICY", "Settlement policy already committed", claim.policyVersion],
  ["ACCEPTED", "GitHub acceptance evidence created an obligation", short(proof.contribution.acceptedWorkId, 12, 10)],
  ["CLAIMED", "Tender fingerprinted the economics", short(claim.claimId, 15, 8)],
  ["CLEARED", "KeeperHub settled 0.01 USDC", short(proof.settlement.transactionHash, 14, 10)],
  ["RECEIPT", "Economic history frozen", short(receipt.receiptId, 15, 8)]
];

timelineEl.innerHTML = timeline
  .map(([state, label, detail]) => `<li><span class="timeline-state">${escapeHtml(state)}</span><div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(detail)}</span></div></li>`)
  .join("");

replayButton.addEventListener("click", async () => {
  replayButton.disabled = true;
  replayButton.textContent = "Verifying same obligation…";
  replayButton.setAttribute("aria-busy", "true");

  try {
    const result = await getJson("/api/replay", { method: "POST" });
    statusEl.textContent = "ALREADY SETTLED";
    statusEl.className = "ALREADY_SETTLED";
    stampEl.innerHTML = "NO SECOND<br />PAYMENT";
    stampEl.className = "stamp ALREADY_SETTLED";
    stampEl.dataset.state = "ALREADY_SETTLED";
    proofEl.textContent = `Same obligation → ${result.status} → ${result.additionalKeeperHubExecutions} additional KeeperHub executions → ${result.additionalMovement} moved.`;
    replayPanel.classList.add("replayed");
    $("#same-claim").textContent = result.sameClaim ? "TRUE" : "FALSE";
    $("#extra-executions").textContent = String(result.additionalKeeperHubExecutions);
    $("#extra-movement").textContent = result.additionalMovement;
    replayButton.textContent = "Same obligation proven · $0 moved";
    replayButton.title = `Evaluated by ${result.engine} at ${result.evaluatedAt}`;
  } catch (error) {
    replayButton.disabled = false;
    replayButton.textContent = "Verification failed — retry";
    proofEl.textContent = error instanceof Error ? error.message : "Runtime replay failed";
  } finally {
    replayButton.removeAttribute("aria-busy");
  }
});

chainButton.addEventListener("click", async () => {
  chainButton.disabled = true;
  chainButton.textContent = "Checking Base Sepolia…";
  chainPanel.classList.remove("verified");
  try {
    const result = await getJson("/api/chain-proof");
    chainPanel.classList.add("verified");
    chainProofEl.textContent = `VERIFIED · Independent Base RPC found a successful USDC Transfer of ${result.amount} USDC to ${short(result.recipient)} in block ${result.blockNumber}. KeeperHub was not trusted for this check.`;
    chainButton.textContent = "Independent chain proof verified";
  } catch (error) {
    chainButton.disabled = false;
    chainButton.textContent = "Retry independent verification";
    chainProofEl.textContent = error instanceof Error ? error.message : "Independent chain verification failed";
  }
});

inspectorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  inspectButton.disabled = true;
  inspectButton.textContent = "Recomputing fingerprint…";
  verificationResult.className = "verification-result";

  try {
    const candidate = await getJson("/api/claim/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: $("#inspect-amount").value,
        recipient: $("#inspect-recipient").value,
        policyVersion: $("#inspect-policy").value
      })
    });

    if (candidate.sameClaim) {
      verificationResult.classList.add("same");
      verificationResult.innerHTML = `<span class="label">Fingerprint match</span><strong>SAME CLAIM · ALREADY SETTLED</strong><small>${escapeHtml(short(candidate.candidateClaimId, 18, 10))} · 0 broadcasts · $0 moved</small>`;
    } else {
      verificationResult.classList.add("changed");
      verificationResult.innerHTML = `<span class="label">Economic mutation detected</span><strong>NEW CLAIM · REQUIRES ACCEPTANCE</strong><small>${escapeHtml(candidate.changedFields.join(", "))} changed · ${escapeHtml(short(candidate.candidateClaimId, 18, 10))} · $0 moved</small>`;
    }
  } catch (error) {
    verificationResult.classList.add("changed");
    verificationResult.innerHTML = `<span class="label">Verification error</span><strong>FAIL CLOSED</strong><small>${escapeHtml(error instanceof Error ? error.message : "Unknown verifier error")}</small>`;
  } finally {
    inspectButton.disabled = false;
    inspectButton.textContent = "Verify economic identity";
  }
});
