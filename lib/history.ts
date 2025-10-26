import Dexie, { type Table } from 'dexie';

export interface HistoryItem {
  id?: number;
  term: string;
  ts: number;
}

class UweDB extends Dexie {
  history!: Table<HistoryItem, number>;

  constructor() {
    super('uwe-history');
    // FIX: Cast `this` to `Dexie` to resolve a TypeScript error where it fails to
    // recognize inherited methods in the constructor of a subclass.
    (this as Dexie).version(1).stores({
      history: '++id, term, ts',
    });
  }
}

export const db = new UweDB();

const MAX_HISTORY_ITEMS = 50;

export async function pushHistory(term: string) {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return;

  try {
    const existing = await db.history.where('term').equalsIgnoreCase(normalizedTerm).first();

    if (existing && existing.id) {
      await db.history.update(existing.id, { ts: Date.now() });
    } else {
      await db.history.add({ term: normalizedTerm, ts: Date.now() });
    }

    const count = await db.history.count();
    if (count > MAX_HISTORY_ITEMS) {
      const toDelete = await db.history.orderBy('ts').limit(count - MAX_HISTORY_ITEMS).toArray();
      await db.history.bulkDelete(toDelete.map(item => item.id!));
    }
  } catch (error) {
    console.error("Failed to update history:", error);
  }
}

export async function getRecentHistory(limit = 10): Promise<HistoryItem[]> {
  try {
    return await db.history.orderBy('ts').reverse().limit(limit).toArray();
  } catch (error) {
    console.error("Failed to get recent history:", error);
    return [];
  }
}
