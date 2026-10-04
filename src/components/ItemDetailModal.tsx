import React from 'react';
import { InventoryItem, StockMovementLog } from '../types/inventory';
import { BarcodeSvg } from './BarcodeSvg';
import { Printer, ArrowRightLeft, MapPin, Building, Calendar, Edit3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface ItemDetailModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onOpenAdjust: (item: InventoryItem) => void;
  onOpenEdit: (item: InventoryItem) => void;
  movementLogs: StockMovementLog[];
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onOpenAdjust,
  onOpenEdit,
  movementLogs,
}) => {
  if (!item) return null;

  const itemLogs = movementLogs
    .filter((log) => log.itemId === item.id || log.itemSku === item.sku)
    .slice(0, 8);

  const totalValue = item.stock * item.unitCost;
  const marginPerUnit = item.unitPrice - item.unitCost;
  const marginPct =
    item.unitPrice > 0 ? ((marginPerUnit / item.unitPrice) * 100).toFixed(1) : '0';

  const isLowStock = item.stock > 0 && item.stock <= item.minThreshold;
  const isOutOfStock = item.stock === 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-semibold">{item.category}</span>
            <span>·</span>
            <span className="font-mono text-neutral-600">{item.sku}</span>
          </div>
          <DialogTitle className="text-xl mt-1">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Top Barcode and Stock Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex justify-center sm:justify-start">
              <BarcodeSvg sku={item.sku} height={52} />
            </div>

            <div className="flex flex-col gap-2 p-3 bg-neutral-50 rounded-md border border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Current Stock</span>
                <span className="text-xl font-bold text-neutral-900 font-mono tabular-nums">
                  {item.stock} {item.unit || 'pcs'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-200/60">
                <span>Minimum Alert Threshold</span>
                <span className="font-mono tabular-nums font-medium text-neutral-700">
                  {item.minThreshold} {item.unit || 'pcs'}
                </span>
              </div>
              <div className="pt-1">
                {isOutOfStock ? (
                  <span className="text-xs font-semibold text-rose-700">
                    Stockout Alert · Immediate reorder required
                  </span>
                ) : isLowStock ? (
                  <span className="text-xs font-semibold text-amber-700">
                    Low Stock · At or below threshold ({item.minThreshold})
                  </span>
                ) : (
                  <span className="text-xs font-medium text-emerald-700">
                    Optimal Stock Level
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Unit Economics & Valuation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-neutral-50/70 border border-neutral-200 rounded-md">
              <span className="text-[11px] text-neutral-500 block">Unit Cost</span>
              <span className="text-sm font-semibold text-neutral-900 font-mono tabular-nums">
                ${item.unitCost.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-neutral-50/70 border border-neutral-200 rounded-md">
              <span className="text-[11px] text-neutral-500 block">Unit Price</span>
              <span className="text-sm font-semibold text-neutral-900 font-mono tabular-nums">
                ${item.unitPrice.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-neutral-50/70 border border-neutral-200 rounded-md">
              <span className="text-[11px] text-neutral-500 block">Gross Margin</span>
              <span className="text-sm font-semibold text-neutral-900 font-mono tabular-nums">
                {marginPct}%
              </span>
            </div>
            <div className="p-3 bg-neutral-50/70 border border-neutral-200 rounded-md">
              <span className="text-[11px] text-neutral-500 block">Holding Value</span>
              <span className="text-sm font-semibold text-neutral-900 font-mono tabular-nums">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Metadata: Location, Supplier, Description */}
          <div className="space-y-2 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-medium text-neutral-800">Location:</span>
              <span>{item.location || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-medium text-neutral-800">Supplier:</span>
              <span>{item.supplier || 'Standard Supplier'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-medium text-neutral-800">Last Modified:</span>
              <span className="font-mono tabular-nums">
                {new Date(item.lastUpdated).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {item.description && (
              <div className="pt-2 text-neutral-600 border-t border-neutral-200/80">
                <span className="font-medium text-neutral-800 block mb-0.5">Specifications:</span>
                <p className="leading-relaxed">{item.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Item Activity Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-neutral-900">Recent Movement Audit</h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenAdjust(item);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-neutral-700 underline"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Adjust Stock</span>
              </button>
            </div>

            {itemLogs.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3 bg-neutral-50 rounded-md border border-neutral-200 text-center">
                No stock transactions logged yet for this item.
              </p>
            ) : (
              <div className="border border-neutral-200 rounded-md divide-y divide-neutral-200 text-xs">
                {itemLogs.map((log) => (
                  <div key={log.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-semibold tabular-nums ${
                            log.quantityDelta > 0
                              ? 'text-emerald-700'
                              : log.quantityDelta < 0
                              ? 'text-rose-700'
                              : 'text-neutral-700'
                          }`}
                        >
                          {log.quantityDelta > 0 ? `+${log.quantityDelta}` : log.quantityDelta}{' '}
                          {item.unit || 'units'}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span className="font-medium text-neutral-800">{log.reason}</span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-500">{log.actor}</span>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-neutral-500 mt-0.5">{log.notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-neutral-500 tabular-nums text-[11px] block">
                        {new Date(log.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-neutral-700">
                        Bal: {log.newStock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-3 flex flex-row items-center justify-between sm:justify-between w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Label</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenEdit(item);
              }}
              className="inline-flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onOpenAdjust(item);
              }}
            >
              Adjust Stock
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
