export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';

export type MovementType = 'in' | 'out' | 'adjustment' | 'initial';

export type MovementReason =
  | 'PO Received'
  | 'Sales Order'
  | 'Damaged / Waste'
  | 'Inventory Audit'
  | 'Customer Return'
  | 'Supplier Return'
  | 'Transfer'
  | 'Initial Stock'
  | 'Other';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  unitCost: number;
  unitPrice: number;
  location: string;
  supplier: string;
  unit: string;
  description: string;
  lastUpdated: string;
}

export interface StockMovementLog {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  type: MovementType;
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  reason: MovementReason;
  notes: string;
  timestamp: string;
  actor: string;
}

export type ActiveTab = 'inventory' | 'movements' | 'reorder' | 'analytics';
