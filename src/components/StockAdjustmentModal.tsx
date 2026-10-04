import React, { useState } from 'react';
import { InventoryItem, MovementReason, MovementType } from '../types/inventory';
import { ArrowDownRight, ArrowUpRight, CheckSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface StockAdjustmentModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onSubmit: (params: {
    itemId: string;
    type: MovementType;
    quantityDelta: number;
    newStock: number;
    reason: MovementReason;
    notes: string;
    actor: string;
  }) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  item,
  onClose,
  onSubmit,
}) => {
  const [mode, setMode] = useState<'in' | 'out' | 'set'>('in');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<MovementReason>('PO Received');
  const [notes, setNotes] = useState<string>('');
  const [actor, setActor] = useState<string>('Inventory Manager');

  if (!item) return null;

  // Compute preview of new stock
  let delta = 0;
  let computedNewStock = item.stock;

  if (mode === 'in') {
    delta = Math.max(1, quantity || 0);
    computedNewStock = item.stock + delta;
  } else if (mode === 'out') {
    delta = -Math.min(item.stock, Math.max(1, quantity || 0));
    computedNewStock = Math.max(0, item.stock + delta);
  } else {
    // Exact recount
    const target = Math.max(0, quantity || 0);
    delta = target - item.stock;
    computedNewStock = target;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (delta === 0 && mode !== 'set') return;

    let movementType: MovementType = 'adjustment';
    if (mode === 'in') movementType = 'in';
    else if (mode === 'out') movementType = 'out';
    else movementType = 'adjustment';

    onSubmit({
      itemId: item.id,
      type: movementType,
      quantityDelta: delta,
      newStock: computedNewStock,
      reason,
      notes,
      actor: actor.trim() || 'Warehouse Team',
    });
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust Stock Level</DialogTitle>
          <DialogDescription>
            <span>{item.name}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span className="font-mono text-neutral-600">{item.sku}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Stock Indicator */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md border border-neutral-200">
            <span className="text-xs text-neutral-600">Current On-Hand Balance</span>
            <span className="text-sm font-semibold text-neutral-900 font-mono tabular-nums">
              {item.stock} {item.unit || 'units'}
            </span>
          </div>

          {/* Action Mode Segmented Controls */}
          <div>
            <Label className="block mb-1.5">Adjustment Mode</Label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-md">
              <button
                type="button"
                onClick={() => {
                  setMode('in');
                  setReason('PO Received');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  mode === 'in'
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Receive (+)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('out');
                  setReason('Sales Order');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  mode === 'out'
                    ? 'bg-white text-rose-700 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Dispatch (-)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('set');
                  setReason('Inventory Audit');
                  setQuantity(item.stock);
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  mode === 'set'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Audit Count</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <Label htmlFor="stock-qty" className="block mb-1.5">
              {mode === 'set' ? 'Physical Counted Quantity' : 'Quantity to Move'}
            </Label>
            <Input
              id="stock-qty"
              type="number"
              min="0"
              max={mode === 'out' ? item.stock : 999999}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              className="font-mono tabular-nums"
              required
            />
            {mode === 'out' && quantity > item.stock && (
              <p className="mt-1 text-xs text-rose-600">
                Cannot dispatch more than current stock ({item.stock}).
              </p>
            )}
          </div>

          {/* Reason Selection */}
          <div>
            <Label htmlFor="stock-reason" className="block mb-1.5">Movement Reason</Label>
            <select
              id="stock-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as MovementReason)}
              className="w-full h-9 px-3 py-1 text-xs border border-neutral-300 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            >
              {mode === 'in' && (
                <>
                  <option value="PO Received">PO Received (Supplier shipment checked in)</option>
                  <option value="Customer Return">Customer Return</option>
                  <option value="Transfer">Transfer from another branch/bin</option>
                  <option value="Other">Other Receipt</option>
                </>
              )}
              {mode === 'out' && (
                <>
                  <option value="Sales Order">Sales Order (Dispatched to customer)</option>
                  <option value="Damaged / Waste">Damaged / Broken / Expired</option>
                  <option value="Supplier Return">Supplier Return (RMA)</option>
                  <option value="Transfer">Transfer to another location</option>
                  <option value="Other">Other Outbound</option>
                </>
              )}
              {mode === 'set' && (
                <>
                  <option value="Inventory Audit">Inventory Audit / Cycle Count discrepancy</option>
                  <option value="Initial Stock">Initial Stock Calibration</option>
                  <option value="Other">Other Adjustment</option>
                </>
              )}
            </select>
          </div>

          {/* Actor / Staff Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="stock-actor" className="block mb-1.5">Recorded By</Label>
              <Input
                id="stock-actor"
                type="text"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                placeholder="Operator name"
              />
            </div>
            <div>
              <Label className="block mb-1.5">Resulting Balance</Label>
              <div className="h-9 flex items-center px-3 text-xs font-semibold font-mono tabular-nums bg-neutral-100 border border-neutral-200 rounded-md text-neutral-900">
                {computedNewStock} {item.unit || 'units'}
                <span className="ml-1.5 text-xs font-normal text-neutral-500">
                  ({delta > 0 ? `+${delta}` : delta})
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="stock-notes" className="block mb-1.5">Optional Notes / Reference #</Label>
            <Input
              id="stock-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. PO-9821, Invoice #4012, or shelf relocation note"
            />
          </div>

          {/* Footer buttons */}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
