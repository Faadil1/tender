# Tender PRD

## Product Category

Tender is the economic clearing layer for accepted work.

## Product Sentence

Accepted once. Owed once. Settled once.

## Problem

Accepted software work and economic settlement usually live in separate systems. Source systems can show what was accepted, but they do not create a durable economic identity, enforce exactly-once settlement, or preserve correction history. That creates payout delays, duplicate payout risk, weak auditability, and ambiguity over which event created the obligation.

## Product Hypothesis

A pre-committed Settlement Policy plus an Acceptance Packet can create one immutable Tender Claim. Tender can authorize, settle, reconcile, and receipt that claim exactly once through KeeperHub while keeping the public proof surface safe and non-value-moving.

## Core Lifecycle

`PRE-COMMITTED POLICY -> WORK -> ACCEPTANCE -> ACCEPTANCE PACKET -> TENDER CLAIM -> KEEPERHUB SETTLEMENT -> TENDER RECEIPT -> VERIFICATION`

Judge-facing progression:

`ACCEPTED -> CLAIMED -> SETTLEABLE -> SETTLED`

Replay path:

`SAME CLAIM -> ALREADY_SETTLED -> 0 EXTRA EXECUTIONS -> $0 MOVED`

Changed-economics path:

`NEW CLAIM -> REQUIRES ACCEPTANCE -> $0 MOVED`

## Primitive: Tender Claim

A Tender Claim is an immutable economic identity created from accepted contribution evidence and a settlement policy. It binds repository, contribution/task identity, acceptance evidence, accepted-work identity, policy version/digest, recipient(s), asset, chain, and amount.

## Signature Artifact: Tender Receipt

A Tender Receipt records the accepted contribution, Acceptance Packet, claim ID, policy version, recipient(s), economic value, KeeperHub execution, transaction proof, settlement status, and settlement time.

## Operator Path vs Public Proof Path

Tender is not a read-only evidence viewer.

Production/operator authority supports:

- settlement policy creation and versioning;
- obligation creation from acceptance adapters;
- claim authorization;
- KeeperHub settlement;
- reconciliation;
- supersession of unsettled claims;
- corrective claims linked to immutable settled history.

Public judge/demo authority supports only safe proof operations:

- recompute claim identity;
- replay an already-settled claim;
- inspect same-vs-altered economics;
- verify the canonical chain receipt;
- read machine-readable obligation status.

The public runtime must not contain a KeeperHub broadcast credential.

## Correction Semantics

Settled claims are immutable. If amount, recipient, accepted work, or policy changes after settlement, Tender creates a new claim that returns `REQUIRES_ACCEPTANCE` until an explicit operator/correction acceptance authorizes it. A corrective claim links back to the original receipt; it never rewrites the original receipt.

## MVP Acceptance Rule

The first adapter uses GitHub pull request evidence, but GitHub merge is only Adapter #1, not Tender's permanent definition of acceptance. Future adapters can supply explicit maintainer acceptance, accepted-outside-merge work, shared contribution settlement, or non-GitHub task acceptance.
