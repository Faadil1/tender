import test from "node:test";
import assert from "node:assert/strict";
import { idempotencyKeyFor, settlementIdFor } from "../src/domain/identity.js";
import { demoAcceptance, demoContribution } from "../src/server/demoData.js";

test("settlement identity ignores webhook delivery id and preserves economic identity", () => {
  const a = settlementIdFor(demoContribution, demoAcceptance({ eventId: "delivery-1" }));
  const b = settlementIdFor(demoContribution, demoAcceptance({ eventId: "delivery-2" }));
  assert.equal(a, b);
  assert.equal(idempotencyKeyFor(a), `tender:settlement:${a}`);
});

test("settlement identity changes when recipient changes", () => {
  const a = settlementIdFor(demoContribution, demoAcceptance());
  const b = settlementIdFor({ ...demoContribution, recipientWallet: "0x2222222222222222222222222222222222222222" }, demoAcceptance());
  assert.notEqual(a, b);
});
