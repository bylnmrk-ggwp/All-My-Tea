import React from 'react';
import { InventoryItem } from '../types/inventory';
import { Layers, AlertTriangle, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface StatSummaryCardsProps {
  items: InventoryItem[];
  onFilterLowStock: () => void;
  onFilterOutOfStock: () => void;
  onResetFilters: () => void;
  currentStatusFilter: string;
}

export const StatSummaryCards: React.FC<StatSummaryCardsProps> = ({
  items,
  onFilterLowStock,
  onFilterOutOfStock,
  onResetFilters,
  currentStatusFilter,
}) => {
  const totalItemsCount = items.length;
  const totalUnits = items.reduce((acc, item) => acc + item.stock, 0);
  const totalCostValuation = items.reduce((acc, item) => acc + item.stock * item.unitCost, 0);
  const totalRetailValuation = items.reduce((acc, item) => acc + item.stock * item.unitPrice, 0);

  const lowStockItems = items.filter(
    (item) => item.stock > 0 && item.stock <= item.minThreshold
  );
  const outOfStockItems = items.filter((item) => item.stock === 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Valuation */}
      <Card className="p-4 bg-white border-neutral-200">
        <CardContent className="p-0">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Total Valuation</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            ${totalCostValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1.5 text-xs text-neutral-500">
            <span>Retail potential:</span>{' '}
            <span className="font-mono tabular-nums font-medium text-neutral-700">
              ${totalRetailValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Units on Hand */}
      <Card
        onClick={onResetFilters}
        className={`p-4 bg-white cursor-pointer transition-colors ${
          currentStatusFilter === 'all'
            ? 'border-neutral-900 bg-neutral-50/50'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Total Stock Units</span>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            {totalUnits.toLocaleString()}
          </div>
          <div className="mt-1.5 text-xs text-neutral-500">
            <span>Across</span>{' '}
            <span className="font-mono tabular-nums font-medium text-neutral-700">{totalItemsCount}</span>{' '}
            <span>unique SKUs</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Low Stock Items */}
      <Card
        onClick={onFilterLowStock}
        className={`p-4 bg-white cursor-pointer transition-colors ${
          currentStatusFilter === 'low_stock'
            ? 'border-amber-600 bg-amber-50/30'
            : 'border-neutral-200 hover:border-amber-400'
        }`}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-700 font-mono tabular-nums">
            {lowStockItems.length}
          </div>
          <div className="mt-1.5 text-xs text-amber-700/80">
            <span>At or below minimum threshold</span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Out of Stock Items */}
      <Card
        onClick={onFilterOutOfStock}
        className={`p-4 bg-white cursor-pointer transition-colors ${
          currentStatusFilter === 'out_of_stock'
            ? 'border-rose-600 bg-rose-50/30'
            : 'border-neutral-200 hover:border-rose-400'
        }`}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Stockout Alerts</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-700 font-mono tabular-nums">
            {outOfStockItems.length}
          </div>
          <div className="mt-1.5 text-xs text-rose-700/80">
            <span>Critical inventory depletion</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
