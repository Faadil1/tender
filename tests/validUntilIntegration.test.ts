import test from "node:test";
import assert from "node:assert/strict";
import { claimIdFor } from "../src/domain/identity.js";
import type { SettlementPolicy } from "../src/domain/types.js";
import { VALID_UNTIL, validUntilAcceptance, validUntilClaimPreview } from "../src/integrations/validUntil.js";

const policy: SettlementPolicy = {
  version: "policy.valid-until.base-sepolia-usdc.v1",
  token: "USDC",
  chainId: 84532,
  maxAmount: "5",
  requireReview: false,
};

const wallet = "0x2ca7ba27ab8686F3a073c053FaD6258C003a02bb";

test("Valid Until integration points to a named deployed project and real accepted work", () => {
  assert.equal(VALID_UNTIL.name, "Valid Until");
  assert.equal(VALID_UNTIL.repository, "Faadil1/valid-until-agent-os");
  assert.match(VALID_UNTIL.productionUrl, /^https:\/\//);
  assert.match(VALID_UNTIL.acceptedWorkId, /^[0-9a-f]{40}$/);
  assert.match(VALID_UNTIL.acceptedWorkUrl, /valid-until-agent-os\/commit\//);
});

test("delivery/event identity does not change the Valid Until economic claim", () => {
  const first = validUntilAcceptance({
    recipientWallet: wallet,
    amount: "0.01",
    eventId: "delivery-a",
    eventTime: "2026-09-18T00:00:00.000Z",
  });
  const replay = validUntilAcceptance({
    recipientWallet: wallet,
    amount: "0.01",
    eventId: "delivery-b",
    eventTime: "2026-09-18T00:05:00.000Z",
  });

  assert.equal(
    claimIdFor(first.contribution, first.acceptance, policy),
    claimIdFor(replay.contribution, replay.acceptance, policy),
  );
});

test("changed Valid Until economics create a different Tender claim", () => {
  const baseline = validUntilClaimPreview({
    recipientWallet: wallet,
    amount: "0.01",
    policy,
  });
  const changed = validUntilClaimPreview({
    recipientWallet: wallet,
    amount: "0.02",
    policy,
  });

  assert.notEqual(baseline.claimId, changed.claimId);
  assert.equal(baseline.valueMovingExecutionPerformed, false);
  assert.equal(changed.valueMovingExecutionPerformed, false);
});
