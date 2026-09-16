# Tender PRD

## Problem

Open-source contribution and economic settlement are usually separate systems. Code acceptance happens in GitHub while payout happens manually elsewhere. That creates payout delays, duplicate payout risk, weak auditability, ambiguity over what event created the obligation, and unsafe participation for autonomous agents.

## Product Hypothesis

A contribution system can convert an immutable acceptance event into a deterministic settlement claim and execute that claim exactly once through KeeperHub.

## Product Primitive

Tender is a contribution settlement protocol.

It tracks this lifecycle:

`WORK PROMISED -> WORK DELIVERED -> ACCEPTANCE EVIDENCE -> SETTLEMENT CLAIM -> EXECUTION -> RECEIPT`

## Proof Required

- Real GitHub contribution lifecycle.
- Real KeeperHub integration.
- Real economic transaction.
- Deterministic settlement identity.
- Duplicate-event protection.
- Observable receipts.
- Meaningful failure handling.

## Acceptance Rule v0

Settlement becomes owed when:

- The PR is linked to a Tender-backed issue.
- The PR is merged.
- Required checks passed.
- Settlement metadata resolves.
- Recipient wallet is valid.
- No prior successful settlement exists for the same economic identity.

