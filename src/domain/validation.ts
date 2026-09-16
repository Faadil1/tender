import type { Contribution, SettlementPolicy } from "./types.js";

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function isValidWallet(address: string) {
  return EVM_ADDRESS.test(address);
}

export function amountWithinPolicy(amount: string, maxAmount: string) {
  return Number(amount) > 0 && Number(amount) <= Number(maxAmount);
}

export function validateContribution(contribution: Contribution, policy: SettlementPolicy) {
  if (!isValidWallet(contribution.recipientWallet)) return "invalid_recipient_wallet";
  if (contribution.token !== policy.token) return "token_not_allowed";
  if (contribution.chainId !== policy.chainId) return "chain_not_allowed";
  if (!amountWithinPolicy(contribution.amount, policy.maxAmount)) return "amount_outside_policy";
  return undefined;
}
