import type { SettlementRecord, SettlementRepository } from "../domain/types.js";

export class MemorySettlementRepository implements SettlementRepository {
  private readonly records = new Map<string, SettlementRecord>();

  async get(settlementId: string) {
    return this.records.get(settlementId);
  }

  async put(record: SettlementRecord) {
    this.records.set(record.claim.settlementId, record);
  }

  async all() {
    return [...this.records.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}
