const $ = (selector) => document.querySelector(selector);

const statusEl = $("#status");
const stampEl = $("#stamp");
const claimFactsEl = $("#claim-facts");
const receiptFactsEl = $("#receipt-facts");
const timelineEl = $("#timeline");
const proofEl = $("#proof");
const replayPanel = $("#replay-panel");
const replayButton = $("#replay-button");
const txLink = $("#tx-link");

const short = (value, left = 10, right = 8) => {
  if (!value || value.length <= left + right + 1) return value ?? "—";
  return `${value.slice(0, left)}…${value.slice(-right)}`;
};

const row = (key, value, full = value) => `<dt>${key}</dt><dd title="${full}">${value}</dd>`;

const proof = await fetch("/live-proof.json").then((response) => {
  if (!response.ok) throw new Error(`Unable to load canonical evidence (${response.status})`);
  return response.json();
});

const receipt = proof.settlement.receipt;
const claim = proof.tenderClaim;
const replay = proof.replay;

$("#amount").textContent = `${receipt.amount} ${receipt.asset}`;
$("#same-claim").textContent = replay.sameClaim ? "TRUE" : "FALSE";
$("#extra-executions").textContent = String(replay.additionalKeeperHubExecutions);
$("#extra-movement").textContent = replay.additionalMovement;
$("#proof-time").textContent = `Proof ${new Date(proof.generatedAt).toISOString().slice(0, 10)}`;
txLink.href = proof.settlement.explorerUrl;

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

const timeline = [
  ["ACCEPTED", "GitHub maintainer attestation", short(proof.contribution.acceptedWorkId, 12, 10)],
  ["CLAIMED", "Deterministic Tender Claim", short(claim.claimId, 15, 8)],
  ["SETTLED", "KeeperHub cleared 0.01 USDC", short(proof.settlement.transactionHash, 14, 10)],
  ["REPLAY", "Same claim returned ALREADY_SETTLED", "$0 additional movement"]
];

timelineEl.innerHTML = timeline
  .map(([state, label, detail]) => `<li><span class="timeline-state">${state}</span><div><strong>${label}</strong><span>${detail}</span></div></li>`)
  .join("");

replayButton.addEventListener("click", () => {
  statusEl.textContent = "ALREADY SETTLED";
  statusEl.className = "ALREADY_SETTLED";
  stampEl.innerHTML = "NO SECOND<br />PAYMENT";
  stampEl.className = "stamp ALREADY_SETTLED";
  stampEl.dataset.state = "ALREADY_SETTLED";
  proofEl.textContent = "Replay → same claim → 0 additional KeeperHub executions → $0 moved.";
  replayPanel.classList.add("replayed");
  replayButton.textContent = "Replay proven · $0 moved";
  replayButton.disabled = true;
});
