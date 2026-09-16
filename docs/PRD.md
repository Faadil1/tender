# Tender PRD

## Product Category

Tender is settlement infrastructure for accepted software contributions.

## Problem

Accepted software work and economic settlement usually live in separate systems. Review and acceptance happen in GitHub or adjacent tools, while payment happens manually elsewhere. That creates payout delays, duplicate payout risk, weak auditability, and ambiguity over which accepted event created the obligation.

## Product Hypothesis

An accepted contribution can create an immutable Tender Claim. Tender can settle that claim through KeeperHub exactly once and issue a Tender Receipt that proves the causal chain.

## Core Lifecycle

`WORK -> ACCEPTANCE -> CLAIM -> SETTLEMENT -> RECEIPT`

Judge-facing progression:

`ACCEPTED -> CLAIMED -> SETTLEABLE -> SETTLED`

Replay path:

`REPLAY -> SAME CLAIM -> $0 MOVED`

## Primitive: Tender Claim

A Tender Claim is an immutable economic identity created from accepted contribution evidence and a settlement policy.

It binds:

- repository
- contribution/task identity
- acceptance evidence
- accepted-work identity such as merge SHA or maintainer attestation
- policy version
- recipient(s)
- asset
- amount

## Signature Artifact: Tender Receipt

A Tender Receipt records:

- accepted contribution
- acceptance evidence
- claim ID
- policy version
- recipient(s)
- economic value
- KeeperHub execution
- transaction proof
- settlement status

## MVP Acceptance Rule

The first adapter uses GitHub pull request evidence:

- contribution is linked to a task
- acceptance evidence says the work was accepted
- required checks passed
- settlement metadata resolves
- recipient wallet is valid
- no prior successful settlement exists for the same Tender Claim

GitHub merge is the first route to acceptance, not the permanent definition of acceptance.
