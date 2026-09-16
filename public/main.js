const statusEl = document.querySelector("#status");
const stampEl = document.querySelector("#stamp");
const factsEl = document.querySelector("#facts");
const timelineEl = document.querySelector("#timeline");
const attemptsEl = document.querySelector("#attempts");

const routes = {
  merge: "/api/demo/merge",
  replay: "/api/demo/replay",
  checks: "/api/demo/checks-failing",
  wallet: "/api/demo/invalid-wallet"
};

document.querySelectorAll("button[data-action]").forEach((button) => {
  button.addEventListener("click", async () => {
    button.setAttribute("aria-busy", "true");
    await fetch(routes[button.dataset.action], { method: "POST" });
    await load();
    button.removeAttribute("aria-busy");
  });
});

async function load() {
  const res = await fetch("/api/settlements");
  const { records } = await res.json();
  render(records[0]);
}

function render(record) {
  if (!record) return;
  const claim = record.claim;
  statusEl.textContent = record.status;
  statusEl.className = record.status;
  stampEl.textContent = record.status === "ALREADY_SETTLED" ? "NO SECOND PAYMENT" : record.status.replaceAll("_", " ");
  stampEl.dataset.state = record.status;
  stampEl.className = `stamp ${record.status}`;

  const facts = {
    Repository: claim.contribution.repository,
    Issue: `#${claim.contribution.issueId}`,
    PR: `#${claim.contribution.pullRequestId}`,
    Contributor: claim.contribution.contributor,
    Recipient: claim.contribution.recipientWallet,
    Payout: `${claim.contribution.amount} ${claim.contribution.token}`,
    "Merge SHA": claim.acceptance.mergeSha ?? "none",
    "Settlement ID": claim.settlementId,
    "Idempotency key": claim.idempotencyKey,
    "KeeperHub execution": record.keeperHubExecutionId ?? "not started",
    "Transaction hash": record.transactionHash ?? "none"
  };

  factsEl.innerHTML = Object.entries(facts)
    .map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`)
    .join("");

  timelineEl.innerHTML = record.timeline
    .map((item) => `<li><strong>${item.label}</strong><br><span>${item.detail}</span></li>`)
    .join("");

  attemptsEl.innerHTML = record.attempts.length
    ? record.attempts
        .map((attempt) => `<div class="attempt"><strong>${attempt.status}</strong><span>${attempt.executionId}<br>${attempt.transactionHash ?? attempt.error ?? ""}</span></div>`)
        .join("")
    : "<p>No KeeperHub execution was attempted.</p>";
}

await fetch("/api/demo/reset", { method: "POST" });
await load();
