import React from 'react';
import { InventoryItem } from '../types/inventory';
import { AlertTriangle, AlertCircle, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface LowStockViewProps {
  items: InventoryItem[];
  onOpenAdjust: (item: InventoryItem) => void;
  onOpenDetail: (item: InventoryItem) => void;
}

export const LowStockView: React.FC<LowStockViewProps> = ({
  items,
  onOpenAdjust,
  onOpenDetail,
}) => {
  const lowStockItems = items
    .filter((item) => item.stock <= item.minThreshold)
    .sort((a, b) => {
      if (a.stock === 0 && b.stock > 0) return -1;
      if (b.stock === 0 && a.stock > 0) return 1;
      const ratioA = a.stock / Math.max(1, a.minThreshold);
      const ratioB = b.stock / Math.max(1, b.minThreshold);
      return ratioA - ratioB;
    });

  const totalEstReorderCost = lowStockItems.reduce((acc, item) => {
    const recommendedQty = Math.max(item.minThreshold * 2 - item.stock, item.minThreshold);
    return acc + recommendedQty * item.unitCost;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <Card className="p-4 bg-white border-neutral-200">
        <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <span>Low Stock Replenishment Queue</span>
              {lowStockItems.length > 0 && (
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 tabular-nums">
                  {lowStockItems.length} items need restock
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Prioritized replenishment list for items below minimum safety threshold.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-500 block">Est. Replenishment PO Cost</span>
            <span className="text-lg font-bold font-mono text-neutral-900 tabular-nums">
              ${totalEstReorderCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {lowStockItems.length === 0 ? (
        <Card className="p-12 text-center bg-white border-neutral-200">
          <CardContent className="p-0">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">All Stock Levels Optimal</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              None of your inventory items are currently at or below their safety reorder thresholds.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.map((item) => {
            const isOut = item.stock === 0;
            const recommendedQty = Math.max(item.minThreshold * 2 - item.stock, item.minThreshold);
            const poCost = recommendedQty * item.unitCost;

            return (
              <Card
                key={item.id}
                className={`p-4 bg-white transition-all flex flex-col justify-between ${
                  isOut
                    ? 'border-rose-300 shadow-[0_1px_3px_rgba(225,29,72,0.06)]'
                    : 'border-amber-300 shadow-[0_1px_3px_rgba(217,119,6,0.06)]'
                }`}
              >
                <CardContent className="p-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <span className="font-mono text-neutral-700 font-medium">{item.sku}</span>
                          <span>·</span>
                          <span>{item.category}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-neutral-900 mt-1 leading-snug">
                          {item.name}
                        </h4>
                      </div>

                      <div className="shrink-0 text-right">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                            <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Metrics Bar */}
                    <div className="mt-3 p-2.5 bg-neutral-50 rounded-md border border-neutral-200/80 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Current</span>
                        <span
                          className={`font-mono font-bold text-sm tabular-nums ${
                            isOut ? 'text-rose-700' : 'text-amber-700'
                          }`}
                        >
                          {item.stock} {item.unit || 'pcs'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Min Threshold</span>
                        <span className="font-mono font-medium text-sm tabular-nums text-neutral-700">
                          {item.minThreshold} {item.unit || 'pcs'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Recommended Order</span>
                        <span className="font-mono font-bold text-sm tabular-nums text-neutral-900">
                          +{recommendedQty} {item.unit || 'pcs'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-neutral-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Supplier:</span>
                        <span className="font-medium text-neutral-800">{item.supplier || 'Standard Vendor'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Warehouse Bin:</span>
                        <span className="font-medium text-neutral-800">{item.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">PO Estimated Cost:</span>
                        <span className="font-mono font-medium text-neutral-900 tabular-nums">
                          ${poCost.toFixed(2)} (${item.unitCost.toFixed(2)}/unit)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenDetail(item)}
                      className="text-xs text-neutral-600 hover:text-neutral-900 underline"
                    >
                      View Specs & Barcode
                    </button>
                    <Button
                      size="sm"
                      onClick={() => onOpenAdjust(item)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Receive / Restock</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
