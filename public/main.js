const app = document.querySelector("#app");

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const ROUTES = new Set(["/", "/obligation", "/proof", "/lab", "/receipt"]);

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const short = (value, left = 10, right = 8) => {
  const text = String(value ?? "");
  if (!text || text.length <= left + right + 1) return text || "—";
  return text.slice(0, left) + "…" + text.slice(-right);
};

const dateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().replace("T", " ").replace(".000Z", "Z");
};

const getJson = async (url, init = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    let body;
    try {
      body = await response.json();
    } catch {
      body = {};
    }
    if (!response.ok) {
      throw new Error(body?.message || body?.error || url + " failed (" + response.status + ")");
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
};

const currentPath = () => {
  const raw = window.location.pathname.replace(/\/+$/, "") || "/";
  return ROUTES.has(raw) ? raw : "/";
};

const setActiveNav = (path) => {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const active = link.getAttribute("data-nav") === path;
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
};

const seedFrom = (value) => {
  const text = String(value || "tender");
  let a = 0x811c9dc5;
  let b = 0x9e3779b9;
  const out = [];
  for (let i = 0; i < text.length; i += 1) {
    a ^= text.charCodeAt(i);
    a = Math.imul(a, 16777619) >>> 0;
    b = (b + Math.imul(text.charCodeAt(i) + i + 1, 2654435761)) >>> 0;
    out.push((a ^ b) & 255);
  }
  while (out.length < 16) {
    a = Math.imul(a ^ (a >>> 13), 2246822519) >>> 0;
    out.push(a & 255);
  }
  return out;
};

const fingerprintSvg = (claimId) => {
  const seed = seedFrom(claimId);
  const petals = 4 + (seed[0] % 5);
  const warp = 2 + (seed[1] % 4);
  const phase = (seed[2] / 255) * Math.PI * 2;
  const paths = [];

  for (let band = 0; band < 9; band += 1) {
    const points = [];
    for (let step = 0; step <= 180; step += 1) {
      const t = (step / 180) * Math.PI * 2;
      const bandPhase = band * 0.12;
      const radius =
        72 +
        band * 3.1 +
        15 * Math.sin(petals * t + phase + bandPhase) +
        6 * Math.cos((petals + warp) * t - bandPhase);
      const x =
        180 +
        radius * Math.cos(t) +
        11 * Math.sin(warp * t + band * 0.17);
      const y =
        110 +
        radius * 0.61 * Math.sin(t) +
        8 * Math.cos((warp + 1) * t - band * 0.11);
      points.push((step === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2));
    }
    paths.push(
      '<path d="' +
        points.join(" ") +
        '" fill="none" stroke="currentColor" stroke-width="' +
        (0.72 + (band % 3) * 0.16).toFixed(2) +
        '" opacity="' +
        (0.26 + band * 0.06).toFixed(2) +
        '"/>'
    );
  }

  const rings = [34, 54, 78].map((r, index) =>
    '<ellipse cx="180" cy="110" rx="' +
      (r + (seed[index + 5] % 8)) +
      '" ry="' +
      ((r + (seed[index + 7] % 8)) * 0.58).toFixed(2) +
      '" fill="none" stroke="currentColor" stroke-width="0.8" opacity="' +
      (0.34 + index * 0.1).toFixed(2) +
      '"/>'
  );

  return (
    '<svg viewBox="0 0 360 220" role="img" aria-label="Visual identity of this claim">' +
    '<title>Visual identity of this claim</title>' +
    paths.join("") +
    rings.join("") +
    '<path d="M18 110H342M180 14V206" stroke="currentColor" stroke-width="0.55" opacity="0.18"/>' +
    "</svg>"
  );
};

const instrumentMarkup = (proof, options = {}) => {
  const receipt = proof.settlement.receipt;
  const claim = proof.tenderClaim;
  const compact = options.compact ? " compact-instrument" : "";
  const caption = options.caption || "Visual identity of this claim";

  return [
    '<article class="claim-instrument' + compact + '" aria-label="Canonical Tender claim instrument">',
      '<div class="instrument-head">',
        '<div>',
          '<p class="meta-label">Tender claim instrument</p>',
          '<h2 class="instrument-title">One obligation. One identity.</h2>',
        "</div>",
        '<span class="instrument-state">' + escapeHtml(proof.settlement.status) + "</span>",
      "</div>",
      '<div class="instrument-body">',
        '<p class="instrument-amount">' + escapeHtml(receipt.amount) + ' <span>' + escapeHtml(receipt.asset) + "</span></p>",
        '<div class="fingerprint" data-fingerprint="' + escapeHtml(claim.claimId) + '">' + fingerprintSvg(claim.claimId) + "</div>",
        '<span class="fingerprint-caption">' + escapeHtml(caption) + "</span>",
      "</div>",
      '<div class="instrument-foot">',
        '<div class="instrument-id">' + escapeHtml(claim.claimId) + "</div>",
        '<div class="instrument-seal">SETTLED<br/>ONCE</div>',
      "</div>",
    "</article>"
  ].join("");
};

const identityToken = (kind, symbol, name, role) => [
  '<div class="identity-token" data-kind="' + escapeHtml(kind) + '">',
    '<span class="identity-shape" aria-hidden="true">' + escapeHtml(symbol) + "</span>",
    "<div>",
      "<strong>" + escapeHtml(name) + "</strong>",
      "<small>" + escapeHtml(role) + "</small>",
    "</div>",
  "</div>"
].join("");

const identityLegend = () => [
  '<aside class="identity-legend" aria-label="Identity legend">',
    identityToken("acceptance", "A", "Acceptance", "Why value became eligible"),
    identityToken("claim", "C", "Tender Claim", "What is owed"),
    identityToken("execution", "E", "KeeperHub Execution", "How it was executed"),
    identityToken("transaction", "T", "Transaction", "Where it settled on-chain"),
    identityToken("receipt", "R", "Tender Receipt", "Proof it was paid"),
  "</aside>"
].join("");

const sequenceMarkup = (proof) => {
  const receipt = proof.settlement.receipt;
  const items = [
    ["01", "Policy", proof.tenderClaim.policyVersion],
    ["02", "Acceptance", receipt.acceptanceEvidence.acceptanceKind],
    ["03", "Claim", short(proof.tenderClaim.claimId, 11, 7)],
    ["04", "Authorization", "pre-settlement gate"],
    ["05", "Settlement", short(proof.settlement.transactionHash, 11, 7)],
    ["06", "Receipt", short(receipt.receiptId, 11, 7)]
  ];

  return (
    '<div class="sequence" aria-label="Tender causal sequence">' +
    items.map((item) => [
      '<div class="sequence-step done">',
        "<b>" + escapeHtml(item[0] + " · " + item[1]) + "</b>",
        "<span>" + escapeHtml(item[2]) + "</span>",
      "</div>"
    ].join("")).join("") +
    "</div>"
  );
};

const homeMarkup = (proof) => {
  const receipt = proof.settlement.receipt;
  return [
    '<section class="page page-home">',
      '<div class="hero-layout">',
        '<div class="hero-copy">',
          '<p class="eyebrow">Economic clearing for accepted work</p>',
          '<h1 class="display">Accepted once.<br/>Owed once.<br/>Settled once.</h1>',
          '<p class="lede">Accepted work becomes one economic obligation. Tender gives it deterministic identity, clears it through KeeperHub, and refuses to pay it twice.</p>',
          '<div class="hero-actions">',
            '<a class="button primary" href="/proof">Run the proof</a>',
            '<a class="button quiet" href="/obligation">See the case</a>',
          "</div>",
        "</div>",
        instrumentMarkup(proof),
      "</div>",
      '<section class="proof-strip" aria-label="Canonical proof compression">',
        '<div><strong>1</strong><span>accepted obligation</span></div>',
        '<div><strong>1</strong><span>economic claim</span></div>',
        '<div><strong>1</strong><span>settlement</span></div>',
        '<div><strong>$0</strong><span>additional replay movement</span></div>',
      "</section>",
      sequenceMarkup(proof),
      '<section class="two-column">',
        "<div>",
          '<p class="kicker">Canonical case</p>',
          '<h2 class="section-title">The payment happened once.</h2>',
          '<p class="section-copy">A real ' + escapeHtml(receipt.amount) + " " + escapeHtml(receipt.asset) + ' Base Sepolia settlement is bound to one accepted-work identity, one Tender Claim, one KeeperHub execution and one Tender Receipt.</p>',
        "</div>",
        identityLegend(),
      "</section>",
    "</section>"
  ].join("");
};

const caseMarkup = (proof, packet) => {
  const receipt = proof.settlement.receipt;
  const steps = [
    ["01", "Policy", "Economic rules existed before acceptance.", packet.settlementPolicy.version],
    ["02", "Acceptance", "Accepted work made the contribution eligible.", dateTime(receipt.acceptanceEvidence.eventTime)],
    ["03", "Claim", "Tender derived one deterministic economic identity.", proof.tenderClaim.claimId],
    ["04", "Authorization", "Settlement remains gated; no public payment control exists.", "public surface is proof-only"],
    ["05", "Settlement", "KeeperHub executed the recorded value movement.", proof.keeperHub.executionId],
    ["06", "Receipt", "Tender froze the causal settlement artifact.", receipt.receiptId]
  ];

  return [
    '<section class="page">',
      '<header class="page-head">',
        "<div>",
          '<p class="eyebrow">Case · why value became owed</p>',
          '<h1 class="display medium">One obligation,<br/>settled exactly once.</h1>',
        "</div>",
        '<p class="page-note">Case tells the story of the money. Proof is separate: it verifies whether the settlement and replay claims are true.</p>',
      "</header>",
      instrumentMarkup(proof, { compact: true }),
      '<section class="case-stepper" aria-label="Case timeline">',
        steps.map((step) => [
          '<article class="case-step">',
            '<span class="step-number">' + escapeHtml(step[0]) + "</span>",
            "<h3>" + escapeHtml(step[1]) + "</h3>",
            "<p>" + escapeHtml(step[2]) + "</p>",
            '<p class="instrument-id" title="' + escapeHtml(step[3]) + '">' + escapeHtml(short(step[3], 18, 10)) + "</p>",
          "</article>"
        ].join("")).join(""),
      "</section>",
      '<section class="two-column">',
        "<div>",
          '<p class="kicker">Derivation</p>',
          '<h2 class="section-title">Five identities. Five different jobs.</h2>',
          '<div class="ledger-sheet">',
            '<dl class="ledger-row"><dt>Accepted work</dt><dd>' + escapeHtml(proof.contribution.acceptedWorkId) + '</dd><span class="row-status wait">eligible</span></dl>',
            '<dl class="ledger-row"><dt>Tender Claim</dt><dd>' + escapeHtml(proof.tenderClaim.claimId) + '</dd><span class="row-status">owed</span></dl>',
            '<dl class="ledger-row"><dt>KeeperHub Execution</dt><dd>' + escapeHtml(proof.keeperHub.executionId) + '</dd><span class="row-status proof">executed</span></dl>',
            '<dl class="ledger-row"><dt>Transaction</dt><dd>' + escapeHtml(proof.settlement.transactionHash) + '</dd><span class="row-status ok">onchain</span></dl>',
            '<dl class="ledger-row"><dt>Tender Receipt</dt><dd>' + escapeHtml(receipt.receiptId) + '</dd><span class="row-status">recorded</span></dl>',
          "</div>",
          '<div class="action-row">',
            '<a class="button primary" href="/proof">Verify this obligation</a>',
            '<a class="button quiet" href="/receipt">View receipt</a>',
          "</div>",
        "</div>",
        identityLegend(),
      "</section>",
    "</section>"
  ].join("");
};

const proofRegister = (proof) => {
  const receipt = proof.settlement.receipt;
  const items = [
    ["Accepted work", proof.contribution.acceptedWorkId],
    ["Tender Claim", proof.tenderClaim.claimId],
    ["Tender Receipt", receipt.receiptId],
    ["KeeperHub Execution", proof.keeperHub.executionId],
    ["Onchain movement", proof.settlement.transactionHash]
  ];

  return (
    '<div class="proof-register">' +
    items.map((item) => [
      '<div class="proof-register-item">',
        "<strong>" + escapeHtml(item[0]) + "</strong>",
        '<span title="' + escapeHtml(item[1]) + '">' + escapeHtml(short(item[1], 20, 12)) + "</span>",
      "</div>"
    ].join("")).join("") +
    "</div>"
  );
};

const proofMarkup = (proof) => {
  const receipt = proof.settlement.receipt;
  return [
    '<section class="page" id="proof-page">',
      '<header class="page-head">',
        "<div>",
          '<p class="eyebrow">Proof · adversarial verification</p>',
          '<h1 class="display medium">The payment happened.<br/>The replay did not.</h1>',
        "</div>",
        '<p class="page-note">Verification is separate from settlement. This public surface can recompute, inspect and replay an already-settled claim. It cannot broadcast another payment.</p>',
      "</header>",
      '<section class="two-column">',
        instrumentMarkup(proof, { compact: true, caption: "Visual identity of this claim · unchanged on replay" }),
        identityLegend(),
      "</section>",
      '<section class="verification-ledger" aria-label="Verification checks">',
        '<div class="verification-check" id="check-recompute" data-state="pending">',
          '<span class="check-mark">1</span><div><strong>Recompute claim identity</strong><small>Rebuild the economic identity from canonical inputs.</small></div><span class="check-state">checking</span>',
        "</div>",
        '<div class="verification-check" id="check-receipt" data-state="pending">',
          '<span class="check-mark">2</span><div><strong>Receipt matches claim</strong><small>Receipt, claim and settlement references agree.</small></div><span class="check-state">checking</span>',
        "</div>",
        '<div class="verification-check" id="check-chain" data-state="pending">',
          '<span class="check-mark">3</span><div><strong>Independent on-chain check</strong><small>Base RPC must find the expected USDC transfer.</small></div><span class="check-state">checking</span>',
        "</div>",
      "</section>",
      '<div id="verification-warning"></div>',
      '<section class="replay-stage" id="replay">',
        '<div class="replay-head">',
          "<div>",
            '<p class="kicker">Signature interaction</p>',
            '<h2>Replay the same accepted work.</h2>',
          "</div>",
          '<button class="button primary" id="replay-button" type="button" disabled>Preparing replay…</button>',
        "</div>",
        '<div class="counter-grid">',
          '<div class="counter"><span class="counter-label">Claims</span><strong class="counter-value">1</strong><span class="counter-delta" id="delta-claims"></span></div>',
          '<div class="counter"><span class="counter-label">KeeperHub executions</span><strong class="counter-value">1</strong><span class="counter-delta" id="delta-executions"></span></div>',
          '<div class="counter"><span class="counter-label">USDC moved</span><strong class="counter-value">' + escapeHtml(receipt.amount) + '</strong><span class="counter-delta" id="delta-movement"></span></div>',
        "</div>",
        '<div class="replay-result" id="replay-result">',
          "<div>",
            '<p class="kicker">Replay verdict</p>',
            '<p class="replay-verdict">Same claim. No second payment.</p>',
            '<p class="section-copy" id="replay-caption">The claim fingerprint remained unchanged.</p>',
          "</div>",
          '<div class="replay-seal">NO SECOND<br/>PAYMENT</div>',
        "</div>",
        '<div class="system-state">No settlement authorized — nothing to execute.</div>',
        '<div id="replay-error"></div>',
      "</section>",
      '<section class="two-column">',
        "<div>",
          '<p class="kicker">Independent proof</p>',
          '<h2 class="section-title">Trust the chain, not the demo.</h2>',
          '<p class="section-copy" id="chain-copy">The independent Base check is running. KeeperHub self-report is not used as the verifier for this step.</p>',
          '<div class="action-row">',
            '<button class="button proof" id="independent-button" type="button">Verify independently</button>',
            '<a class="button quiet" href="' + escapeHtml(proof.settlement.explorerUrl) + '" target="_blank" rel="noreferrer">View on Base Sepolia</a>',
            '<a class="button quiet" href="/receipt">View receipt</a>',
          "</div>",
        "</div>",
        proofRegister(proof),
      "</section>",
      '<details class="evidence-drawer" id="evidence">',
        "<summary>Technical evidence</summary>",
        '<div class="evidence-body">',
          '<div class="ledger-sheet">',
            '<dl class="ledger-row"><dt>Generated</dt><dd>' + escapeHtml(dateTime(proof.generatedAt)) + '</dd><span class="row-status">canonical</span></dl>',
            '<dl class="ledger-row"><dt>Repository</dt><dd>' + escapeHtml(proof.repository) + '</dd><span class="row-status">source</span></dl>',
            '<dl class="ledger-row"><dt>Policy</dt><dd>' + escapeHtml(proof.tenderClaim.policyVersion) + '</dd><span class="row-status">bound</span></dl>',
            '<dl class="ledger-row"><dt>Execution</dt><dd>' + escapeHtml(proof.keeperHub.executionId) + '</dd><span class="row-status proof">KeeperHub</span></dl>',
            '<dl class="ledger-row"><dt>Transaction</dt><dd>' + escapeHtml(proof.settlement.transactionHash) + '</dd><span class="row-status ok">Base</span></dl>',
          "</div>",
          '<a class="button quiet" href="/api/proof" target="_blank" rel="noreferrer">Open machine-readable proof</a>',
        "</div>",
      "</details>",
    "</section>"
  ].join("");
};

const receiptMarkup = (proof) => {
  const receipt = proof.settlement.receipt;
  return [
    '<section class="page">',
      '<header class="page-head compact">',
        "<div>",
          '<p class="eyebrow">Tender Receipt · shareable artifact</p>',
          '<h1 class="display medium">The settlement,<br/>permanent and public.</h1>',
        "</div>",
        '<a class="button quiet" href="/obligation">Back to case</a>',
      "</header>",
      '<div class="receipt-wrap">',
        '<article class="receipt-artifact">',
          '<div class="receipt-top">',
            "<div>",
              '<p class="meta-label">Tender Receipt</p>',
              '<h2 class="receipt-title">Settlement receipt</h2>',
              '<p class="receipt-id">' + escapeHtml(receipt.receiptId) + "</p>",
            "</div>",
            '<span class="instrument-state">Settled once</span>',
          "</div>",
          '<div class="receipt-main">',
            "<div>",
              '<p class="instrument-amount">' + escapeHtml(receipt.amount) + ' <span>' + escapeHtml(receipt.asset) + "</span></p>",
              '<div class="fingerprint">' + fingerprintSvg(receipt.claimId) + "</div>",
              '<span class="fingerprint-caption">Visual identity of this claim</span>',
            "</div>",
            '<div class="receipt-facts">',
              '<div class="receipt-fact"><span>Accepted work</span><strong>' + escapeHtml(receipt.acceptedContribution) + "</strong></div>",
              '<div class="receipt-fact"><span>Claim</span><strong>' + escapeHtml(receipt.claimId) + "</strong></div>",
              '<div class="receipt-fact"><span>KeeperHub execution</span><strong>' + escapeHtml(receipt.keeperHubExecutionId) + "</strong></div>",
              '<div class="receipt-fact"><span>Transaction</span><strong>' + escapeHtml(receipt.transactionHash) + "</strong></div>",
              '<div class="receipt-fact"><span>Settled at</span><strong>' + escapeHtml(dateTime(receipt.settledAt)) + "</strong></div>",
            "</div>",
          "</div>",
          '<div class="receipt-bottom">',
            '<p class="meta-label">Economic record</p>',
            '<p class="section-copy" style="color:#6f625d">This artifact records one accepted contribution, one Tender Claim, one KeeperHub execution and the on-chain transaction that cleared it.</p>',
          "</div>",
        "</article>",
      "</div>",
      '<div class="action-row" style="justify-content:center">',
        '<button class="button primary" id="copy-receipt-link" type="button">Share / copy link</button>',
        '<a class="button quiet" href="' + escapeHtml(proof.settlement.explorerUrl) + '" target="_blank" rel="noreferrer">View on Base Sepolia</a>',
      "</div>",
      '<p class="page-note" id="copy-status" style="justify-self:center"></p>',
    "</section>"
  ].join("");
};

const labMarkup = (proof) => {
  const receipt = proof.settlement.receipt;
  return [
    '<section class="page">',
      '<header class="page-head">',
        "<div>",
          '<p class="eyebrow">Invariant Lab · read-only</p>',
          '<h1 class="display medium">Change the economics.<br/>Watch the identity change.</h1>',
        "</div>",
        '<p class="page-note">Mutation changes identity. Replay changes nothing. Candidate claims in this lab are hypothetical and cannot settle from this public surface.</p>',
      "</header>",
      '<section class="lab-grid">',
        '<article class="lab-card">',
          '<div class="lab-card-head"><strong>Canonical</strong><span class="row-status ok">settled</span></div>',
          '<div class="lab-card-body">',
            '<div class="claim-instrument" style="box-shadow:none">',
              '<div class="instrument-body" style="min-height:300px">',
                '<p class="instrument-amount">' + escapeHtml(receipt.amount) + ' <span>' + escapeHtml(receipt.asset) + "</span></p>",
                '<div class="fingerprint" style="inset:72px 6px 8px">' + fingerprintSvg(proof.tenderClaim.claimId) + "</div>",
                '<span class="fingerprint-caption" style="margin-top:165px">Visual identity of this claim</span>',
              "</div>",
              '<div class="instrument-foot"><div class="instrument-id">' + escapeHtml(proof.tenderClaim.claimId) + '</div><div class="instrument-seal">CANONICAL</div></div>',
            "</div>",
          "</div>",
        "</article>",
        '<article class="lab-card">',
          '<div class="lab-card-head"><strong>Hypothetical — cannot settle</strong><span class="row-status wait">read-only</span></div>',
          '<div class="lab-card-body">',
            '<form class="lab-form" id="lab-form">',
              '<label>Amount<input id="lab-amount" name="amount" autocomplete="off" value="' + escapeHtml(receipt.amount) + '"/></label>',
              '<label>Recipient<input id="lab-recipient" name="recipient" autocomplete="off" value="' + escapeHtml(receipt.recipients[0].wallet) + '"/></label>',
              '<label>Policy version<input id="lab-policy" name="policyVersion" autocomplete="off" value="' + escapeHtml(proof.tenderClaim.policyVersion) + '"/></label>',
              '<button class="button primary" id="lab-submit" type="submit">Mutate an input</button>',
            "</form>",
          "</div>",
          '<div class="lab-result" id="lab-result">',
            '<p class="kicker">Candidate</p>',
            '<strong>Canonical values loaded.</strong>',
            '<small>Change one field, then recompute the candidate identity.</small>',
          "</div>",
        "</article>",
      "</section>",
      '<div class="action-row">',
        '<button class="button quiet" id="lab-reset" type="button">Reset to canonical</button>',
        '<a class="button quiet" href="/proof#replay">Replay canonical claim</a>',
      "</div>",
    "</section>"
  ].join("");
};

const fatalMarkup = (message) => [
  '<section class="page">',
    '<div class="failure-panel danger">',
      '<p class="kicker">Canonical proof unavailable</p>',
      '<h1 class="display medium">Nothing here is verified.</h1>',
      '<p>Cannot verify right now. ' + escapeHtml(message) + "</p>",
      '<button class="button quiet" id="retry-boot" type="button">Retry verification</button>',
    "</div>",
  "</section>"
].join("");

const render = (path, data) => {
  if (path === "/") return homeMarkup(data.proof);
  if (path === "/obligation") return caseMarkup(data.proof, data.packet);
  if (path === "/proof") return proofMarkup(data.proof);
  if (path === "/receipt") return receiptMarkup(data.proof);
  if (path === "/lab") return labMarkup(data.proof);
  return homeMarkup(data.proof);
};

const setCheck = (id, state, stateText, detail) => {
  const node = document.querySelector(id);
  if (!node) return;
  node.dataset.state = state;
  const mark = node.querySelector(".check-mark");
  const status = node.querySelector(".check-state");
  const small = node.querySelector("small");
  if (mark) mark.textContent = state === "verified" ? "✓" : state === "failed" ? "!" : "·";
  if (status) status.textContent = stateText;
  if (small && detail) small.textContent = detail;
};

const runIndependentChainCheck = async () => {
  const chainCopy = document.querySelector("#chain-copy");
  const button = document.querySelector("#independent-button");
  if (button) {
    button.disabled = true;
    button.textContent = "Checking Base…";
  }
  setCheck("#check-chain", "pending", "checking", "Querying independent Base Sepolia RPC.");

  try {
    const result = await getJson("/api/chain-proof");
    setCheck(
      "#check-chain",
      "verified",
      "verified",
      "Matched USDC transfer in block " + result.blockNumber + "."
    );
    if (chainCopy) {
      chainCopy.textContent =
        "Independent Base RPC matched the expected " +
        result.amount +
        " USDC transfer. KeeperHub was not trusted for this check.";
    }
    if (button) button.textContent = "Verified independently";
    return true;
  } catch (error) {
    setCheck(
      "#check-chain",
      "partial",
      "unavailable",
      "ON-CHAIN CHECK UNAVAILABLE — RPC unreachable"
    );
    if (chainCopy) {
      chainCopy.textContent =
        "The recorded settlement remains available, but independent chain verification could not be completed right now.";
    }
    if (button) {
      button.disabled = false;
      button.textContent = "Retry independent check";
    }
    return false;
  }
};

const bindProof = async (data) => {
  const proof = data.proof;
  const receipt = proof.settlement.receipt;
  const replayButton = document.querySelector("#replay-button");
  const receiptMatches =
    receipt.claimId === proof.tenderClaim.claimId &&
    receipt.keeperHubExecutionId === proof.keeperHub.executionId &&
    receipt.transactionHash === proof.settlement.transactionHash;

  setCheck(
    "#check-receipt",
    receiptMatches ? "verified" : "failed",
    receiptMatches ? "verified" : "mismatch",
    receiptMatches
      ? "Receipt, claim, execution and transaction references agree."
      : "Receipt references do not match the canonical proof."
  );

  let canonicalRecomputed = false;
  try {
    const recompute = await getJson("/api/claim/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: receipt.amount,
        recipient: receipt.recipients[0].wallet,
        policyVersion: proof.tenderClaim.policyVersion
      })
    });
    canonicalRecomputed =
      recompute.sameClaim === true &&
      recompute.candidateClaimId === proof.tenderClaim.claimId;
    setCheck(
      "#check-recompute",
      canonicalRecomputed ? "verified" : "failed",
      canonicalRecomputed ? "verified" : "mismatch",
      canonicalRecomputed
        ? "Canonical inputs recompute to the same Tender Claim."
        : "Recomputed identity did not match the canonical claim."
    );
  } catch {
    setCheck(
      "#check-recompute",
      "failed",
      "unverified",
      "UNVERIFIED — verification service unavailable"
    );
  }

  if (replayButton) {
    replayButton.disabled = !canonicalRecomputed || !receiptMatches;
    replayButton.textContent =
      canonicalRecomputed && receiptMatches
        ? "Replay settlement"
        : "Replay unavailable";
  }

  runIndependentChainCheck();

  const independentButton = document.querySelector("#independent-button");
  if (independentButton) {
    independentButton.addEventListener("click", () => runIndependentChainCheck());
  }

  if (!replayButton) return;

  replayButton.addEventListener("click", async () => {
    replayButton.disabled = true;
    replayButton.textContent = "Replaying canonical claim…";
    replayButton.setAttribute("aria-busy", "true");

    const resultBox = document.querySelector("#replay-result");
    const errorBox = document.querySelector("#replay-error");
    if (resultBox) resultBox.classList.remove("visible");
    if (errorBox) errorBox.innerHTML = "";

    try {
      const result = await getJson("/api/replay", { method: "POST" });
      if (
        result.sameClaim !== true ||
        result.additionalKeeperHubExecutions !== 0 ||
        String(result.additionalMovement).replace(".00", "") !== "$0"
      ) {
        throw new Error("Replay returned an unexpected economic delta.");
      }

      document.querySelector("#delta-claims").textContent = "Δ 0";
      document.querySelector("#delta-executions").textContent = "Δ 0";
      document.querySelector("#delta-movement").textContent = "Δ $0.00";
      document.querySelector("#replay-caption").textContent =
        "Unchanged after replay · " + short(result.claimId, 18, 10);
      if (resultBox) resultBox.classList.add("visible");
      replayButton.textContent = "Replay verified · Δ $0.00";
      replayButton.title = "Evaluated at " + result.evaluatedAt;
    } catch (error) {
      if (errorBox) {
        errorBox.innerHTML = [
          '<div class="failure-panel danger">',
            '<p class="kicker">Replay could not run</p>',
            "<h2>REPLAY COULD NOT RUN — no conclusion drawn.</h2>",
            "<p>" + escapeHtml(error instanceof Error ? error.message : "Replay verification failed.") + "</p>",
          "</div>"
        ].join("");
      }
      replayButton.disabled = false;
      replayButton.textContent = "Retry replay";
    } finally {
      replayButton.removeAttribute("aria-busy");
    }
  });
};

const bindReceipt = () => {
  const button = document.querySelector("#copy-receipt-link");
  const status = document.querySelector("#copy-status");
  if (!button) return;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      button.textContent = "Link copied";
      if (status) status.textContent = "Receipt permalink copied.";
    } catch {
      if (status) status.textContent = "Copy unavailable. Use the current page URL.";
    }
  });
};

const bindLab = (data) => {
  const form = document.querySelector("#lab-form");
  const reset = document.querySelector("#lab-reset");
  const result = document.querySelector("#lab-result");
  const receipt = data.proof.settlement.receipt;

  const resetValues = () => {
    document.querySelector("#lab-amount").value = receipt.amount;
    document.querySelector("#lab-recipient").value = receipt.recipients[0].wallet;
    document.querySelector("#lab-policy").value = data.proof.tenderClaim.policyVersion;
    if (result) {
      result.innerHTML =
        '<p class="kicker">Candidate</p><strong>Canonical values loaded.</strong><small>Change one field, then recompute the candidate identity.</small>';
    }
  };

  if (reset) reset.addEventListener("click", resetValues);
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = document.querySelector("#lab-submit");
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Recomputing candidate…";
    }

    try {
      const candidate = await getJson("/api/claim/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: document.querySelector("#lab-amount").value,
          recipient: document.querySelector("#lab-recipient").value,
          policyVersion: document.querySelector("#lab-policy").value
        })
      });

      if (candidate.sameClaim) {
        result.innerHTML = [
          '<p class="kicker">Canonical identity</p>',
          "<strong>SAME CLAIM · ALREADY SETTLED</strong>",
          '<div class="candidate-portrait"><div class="fingerprint">' + fingerprintSvg(candidate.candidateClaimId) + '</div><span class="candidate-portrait-label">Same portrait · unchanged</span></div>',
          '<small>Unchanged economics -> unchanged claim. This public lab cannot settle anything.</small>'
        ].join("");
      } else {
        result.innerHTML = [
          '<p class="kicker">Hypothetical — cannot settle</p>',
          "<strong>NEW CLAIM · REQUIRES ACCEPTANCE</strong>",
          '<div class="candidate-portrait changed"><div class="fingerprint">' + fingerprintSvg(candidate.candidateClaimId) + '</div><span class="candidate-portrait-label">Different portrait · changed economics</span></div>',
          '<small>' + escapeHtml((candidate.changedFields || []).join(", ") || "Economic identity changed") + " · " + escapeHtml(short(candidate.candidateClaimId, 18, 10)) + "</small>"
        ].join("");
      }
    } catch (error) {
      result.innerHTML = [
        '<p class="kicker">Invalid candidate</p>',
        "<strong>No fingerprint: no valid claim</strong>",
        "<small>" + escapeHtml(error instanceof Error ? error.message : "This candidate cannot be recomputed from the supplied values.") + "</small>"
      ].join("");
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = "Mutate an input";
      }
    }
  });
};

const bindPage = async (path, data) => {
  if (path === "/proof") await bindProof(data);
  if (path === "/receipt") bindReceipt();
  if (path === "/lab") bindLab(data);
};

const boot = async () => {
  const path = currentPath();
  setActiveNav(path);

  try {
    const [runtime, proof, packet] = await Promise.all([
      getJson("/api/runtime"),
      getJson("/api/proof"),
      getJson("/api/acceptance-packet")
    ]);

    const data = { runtime, proof, packet };
    app.innerHTML = render(path, data);
    document.title =
      path === "/"
        ? "Tender — Accepted once. Owed once. Settled once."
        : "Tender — " +
          ({ "/obligation": "Case", "/proof": "Proof", "/lab": "Invariant Lab", "/receipt": "Receipt" }[path] || "Proof");
    await bindPage(path, data);

    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    }

    if (window.location.hash) {
      requestAnimationFrame(() => {
        const target = document.querySelector(window.location.hash);
        if (target) target.scrollIntoView({ block: "start" });
      });
    }
  } catch (error) {
    app.innerHTML = fatalMarkup(
      error instanceof Error ? error.message : "Canonical proof could not be loaded."
    );
    const retry = document.querySelector("#retry-boot");
    if (retry) retry.addEventListener("click", () => window.location.reload());
  }
};

boot();
