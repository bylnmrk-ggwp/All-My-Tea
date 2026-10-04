import React from 'react';
import { InventoryItem } from '../types/inventory';
import { TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './ui/table';

interface AnalyticsViewProps {
  items: InventoryItem[];
  onOpenDetail: (item: InventoryItem) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ items, onOpenDetail }) => {
  // Total Valuation
  const totalCost = items.reduce((acc, item) => acc + item.stock * item.unitCost, 0);
  const totalRetail = items.reduce((acc, item) => acc + item.stock * item.unitPrice, 0);
  const totalMargin = totalRetail - totalCost;
  const overallMarginPct = totalRetail > 0 ? ((totalMargin / totalRetail) * 100).toFixed(1) : '0';

  // Category breakdown
  const categoryStats = React.useMemo(() => {
    const map: Record<
      string,
      { count: number; units: number; costVal: number; retailVal: number }
    > = {};

    items.forEach((item) => {
      const cat = item.category || 'Uncategorized';
      if (!map[cat]) {
        map[cat] = { count: 0, units: 0, costVal: 0, retailVal: 0 };
      }
      map[cat].count += 1;
      map[cat].units += item.stock;
      map[cat].costVal += item.stock * item.unitCost;
      map[cat].retailVal += item.stock * item.unitPrice;
    });

    return Object.entries(map)
      .map(([category, stats]) => ({
        category,
        ...stats,
        marginVal: stats.retailVal - stats.costVal,
        percentOfTotalCost: totalCost > 0 ? (stats.costVal / totalCost) * 100 : 0,
      }))
      .sort((a, b) => b.costVal - a.costVal);
  }, [items, totalCost]);

  // Top Capital Items
  const topValuedItems = React.useMemo(() => {
    return [...items]
      .map((item) => ({
        ...item,
        totalVal: item.stock * item.unitCost,
      }))
      .sort((a, b) => b.totalVal - a.totalVal)
      .slice(0, 5);
  }, [items]);

  // Stock Health
  const outOfStockCount = items.filter((i) => i.stock === 0).length;
  const lowStockCount = items.filter((i) => i.stock > 0 && i.stock <= i.minThreshold).length;
  const healthyCount = items.filter((i) => i.stock > i.minThreshold).length;
  const totalCount = Math.max(1, items.length);

  const healthyPct = Math.round((healthyCount / totalCount) * 100);
  const lowStockPct = Math.round((lowStockCount / totalCount) * 100);
  const outOfStockPct = Math.round((outOfStockCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 bg-white border-neutral-200">
        <CardContent className="p-0">
          <h2 className="text-base font-semibold text-neutral-900">
            Valuation & Portfolio Analytics
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Working capital allocation, category concentration, and inventory health distribution.
          </p>
        </CardContent>
      </Card>

      {/* Top 3 High Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-neutral-200">
          <CardContent className="p-0">
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Total Capital Invested (Cost)</span>
              <DollarSign className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900">
              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Direct inventory acquisition cost</p>
          </CardContent>
        </Card>

        <Card className="p-4 bg-white border-neutral-200">
          <CardContent className="p-0">
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Projected Sales Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900">
              ${totalRetail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-neutral-500 mt-1">If all physical units sell at retail price</p>
          </CardContent>
        </Card>

        <Card className="p-4 bg-white border-neutral-200">
          <CardContent className="p-0">
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Gross Unrealized Profit</span>
              <span className="font-mono text-xs font-semibold text-neutral-700">{overallMarginPct}% margin</span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-700">
              +${totalMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Projected gross profit spread</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Health Bar */}
      <Card className="p-4 bg-white border-neutral-200">
        <CardContent className="p-0">
          <h3 className="text-xs font-semibold text-neutral-900 mb-2">Inventory Health Ratio</h3>
          <div className="h-3 w-full bg-neutral-100 rounded-sm overflow-hidden flex">
            <div
              style={{ width: `${healthyPct}%` }}
              className="bg-emerald-600 h-full"
              title={`Healthy: ${healthyCount} (${healthyPct}%)`}
            />
            <div
              style={{ width: `${lowStockPct}%` }}
              className="bg-amber-500 h-full"
              title={`Low Stock: ${lowStockCount} (${lowStockPct}%)`}
            />
            <div
              style={{ width: `${outOfStockPct}%` }}
              className="bg-rose-600 h-full"
              title={`Stockout: ${outOfStockCount} (${outOfStockPct}%)`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-neutral-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Optimal Stock:</span>
              <span className="font-mono font-semibold tabular-nums text-neutral-900">
                {healthyCount} ({healthyPct}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Low Threshold:</span>
              <span className="font-mono font-semibold tabular-nums text-neutral-900">
                {lowStockCount} ({lowStockPct}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
              <span>Depleted (Zero):</span>
              <span className="font-mono font-semibold tabular-nums text-neutral-900">
                {outOfStockCount} ({outOfStockPct}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Table */}
      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50/70">
          <h3 className="text-xs font-semibold text-neutral-900">
            Valuation Breakdown by Category
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-neutral-50/40">
            <TableRow className="border-b border-neutral-200 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold">
              <TableHead className="py-2.5 px-4">Category</TableHead>
              <TableHead className="py-2.5 px-3 text-right">SKUs</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Total Units</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Capital Cost</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Retail Value</TableHead>
              <TableHead className="py-2.5 pr-4 pl-3 text-right">% of Capital</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryStats.map((stat) => (
              <TableRow key={stat.category} className="hover:bg-neutral-50/60">
                <TableCell className="py-2.5 px-4 font-medium text-neutral-900">
                  {stat.category}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                  {stat.count}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                  {stat.units.toLocaleString()}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900">
                  ${stat.costVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                  ${stat.retailVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="py-2.5 pr-4 pl-3 text-right font-mono tabular-nums text-neutral-600">
                  {stat.percentOfTotalCost.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Top 5 High Capital Items */}
      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50/70">
          <h3 className="text-xs font-semibold text-neutral-900">
            Top 5 Capital Concentrations (Highest Value on Hand)
          </h3>
        </div>
        <div className="divide-y divide-neutral-200/80">
          {topValuedItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onOpenDetail(item)}
              className="p-3 px-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-neutral-400 text-xs w-4">
                  0{idx + 1}.
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900 hover:underline">
                    {item.name}
                  </h4>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono">{item.sku}</span>
                    <span>·</span>
                    <span>{item.category}</span>
                    <span>·</span>
                    <span>Location: {item.location}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold font-mono text-neutral-900 tabular-nums block">
                  ${item.totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono tabular-nums">
                  {item.stock} {item.unit || 'pcs'} @ ${item.unitCost.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
