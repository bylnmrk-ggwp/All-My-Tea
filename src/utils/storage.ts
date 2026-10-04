import { InventoryItem, StockMovementLog } from '../types/inventory';
import { INITIAL_ITEMS, INITIAL_LOGS } from '../data/initialData';

const ITEMS_STORAGE_KEY = 'inventrak_inventory_items_v1';
const LOGS_STORAGE_KEY = 'inventrak_stock_logs_v1';

export function loadStoredItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (!raw) {
      saveStoredItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ITEMS;
  } catch (err) {
    console.error('Failed to load items from localStorage:', err);
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: InventoryItem[]): void {
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to localStorage:', err);
  }
}

export function loadStoredLogs(): StockMovementLog[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      saveStoredLogs(INITIAL_LOGS);
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_LOGS;
  } catch (err) {
    console.error('Failed to load logs from localStorage:', err);
    return INITIAL_LOGS;
  }
}

export function saveStoredLogs(logs: StockMovementLog[]): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save logs to localStorage:', err);
  }
}

export function resetAllStorage(): { items: InventoryItem[]; logs: StockMovementLog[] } {
  saveStoredItems(INITIAL_ITEMS);
  saveStoredLogs(INITIAL_LOGS);
  return { items: INITIAL_ITEMS, logs: INITIAL_LOGS };
}
