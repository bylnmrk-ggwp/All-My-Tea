import React from 'react';
import { Order } from '../../types/allmytea';
import { Card, CardContent } from '../ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import { TrendingUp, ShoppingBag, Banknote, Smartphone, Users } from 'lucide-react';

interface SalesAnalyticsViewProps {
  orders: Order[];
}

export const SalesAnalyticsView: React.FC<SalesAnalyticsViewProps> = ({ orders }) => {
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

  // Breakdown by channel / type
  const channelStats = React.useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {
      'dine-in': { count: 0, total: 0 },
      'take-out': { count: 0, total: 0 },
      'delivery': { count: 0, total: 0 },
      'pick-up': { count: 0, total: 0 },
    };

    orders.forEach((o) => {
      if (!map[o.type]) map[o.type] = { count: 0, total: 0 };
      map[o.type].count += 1;
      map[o.type].total += o.total;
    });

    return Object.entries(map).map(([type, stat]) => ({
      type,
      ...stat,
      percentOfSales: totalSales > 0 ? (stat.total / totalSales) * 100 : 0,
    }));
  }, [orders, totalSales]);

  // Breakdown by payment
  const paymentStats = React.useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    orders.forEach((o) => {
      if (!map[o.paymentMethod]) map[o.paymentMethod] = { count: 0, total: 0 };
      map[o.paymentMethod].count += 1;
      map[o.paymentMethod].total += o.total;
    });
    return Object.entries(map).map(([method, stat]) => ({
      method,
      ...stat,
      percent: totalSales > 0 ? (stat.total / totalSales) * 100 : 0,
    }));
  }, [orders, totalSales]);

  // Top Selling Items
  const topItems = React.useMemo(() => {
    const itemMap: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};

    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, category: item.category, qty: 0, revenue: 0 };
        }
        itemMap[item.name].qty += item.quantity;
        itemMap[item.name].revenue += item.subtotal;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 7);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-xs">
        <h2 className="text-base font-bold text-neutral-900">
          Daily Sales & Operational Performance
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Real-time metrics for All My Tea Burger & Milktea Diffun branch.
        </p>
      </div>

      {/* 3 Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-neutral-200">
          <CardContent className="p-0">
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Gross Sales (PHP)</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900">
              ₱{totalSales.toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Aggregated store revenue</p>
          </CardContent>
        </Card>

        <Card className="p-4 bg-white border-neutral-200">
          <CardContent className="p-0">
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Total Orders Count</span>
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900">
              {totalOrdersCount} orders
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Processed today</p>
          </CardContent>
        </Card>

        <Card className="p-4 bg-white border-neutral-200">
          <CardContent className="p-0">
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span>Average Ticket Size</span>
              <span className="font-mono text-xs text-neutral-400">AOV</span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900">
              ₱{avgOrderValue.toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Average per customer receipt</p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Breakdown & Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dining Channels */}
        <Card className="p-4 bg-white border-neutral-200">
          <CardContent className="p-0 space-y-3">
            <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
              Sales by Service Channel
            </h3>
            <div className="space-y-2 text-xs">
              {channelStats.map((ch) => (
                <div key={ch.type} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="capitalize">{ch.type} ({ch.count} orders)</span>
                    <span className="font-mono tabular-nums">₱{ch.total.toLocaleString()} ({ch.percentOfSales.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded overflow-hidden">
                    <div
                      style={{ width: `${ch.percentOfSales}%` }}
                      className="bg-amber-800 h-full rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="p-4 bg-white border-neutral-200">
          <CardContent className="p-0 space-y-3">
            <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
              Payment Method Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              {paymentStats.map((p) => (
                <div key={p.method} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>{p.method} ({p.count} transactions)</span>
                    <span className="font-mono tabular-nums">₱{p.total.toLocaleString()} ({p.percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded overflow-hidden">
                    <div
                      style={{ width: `${p.percent}%` }}
                      className={p.method === 'GCash' ? 'bg-blue-600 h-full rounded' : p.method === 'Maya' ? 'bg-emerald-600 h-full rounded' : 'bg-neutral-800 h-full rounded'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Best-Selling Items Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/70">
          <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
            Top Selling Food & Drink Items
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-neutral-50/40">
            <TableRow className="border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <TableHead className="py-2.5 px-4">Rank & Item</TableHead>
              <TableHead className="py-2.5 px-3">Category</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Units Sold</TableHead>
              <TableHead className="py-2.5 pr-4 pl-3 text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topItems.map((item, idx) => (
              <TableRow key={item.name} className="hover:bg-neutral-50/60">
                <TableCell className="py-2.5 px-4 font-medium text-xs text-neutral-900">
                  <span className="font-mono text-neutral-400 mr-2">#{idx + 1}</span>
                  {item.name}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-xs text-neutral-600">{item.category}</TableCell>
                <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-xs font-bold text-neutral-900">
                  {item.qty} pcs
                </TableCell>
                <TableCell className="py-2.5 pr-4 pl-3 text-right font-mono tabular-nums text-xs font-semibold text-amber-900">
                  ₱{item.revenue.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
