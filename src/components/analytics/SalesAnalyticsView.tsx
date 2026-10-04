import React from 'react';
import { Order } from '../../types/allmytea';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import { PageHeader } from '../staff/PageHeader';
import { Panel } from '../staff/Panel';
import { KpiCard } from '../staff/KpiCard';
import { EmptyState } from '../staff/EmptyState';

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
      <PageHeader title="Reports" description="Sales by channel, payment, and item." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Gross sales" value={`₱${totalSales.toLocaleString('en-PH')}`} hint="All recorded orders" />
        <KpiCard label="Orders" value={totalOrdersCount} hint="Tickets processed" />
        <KpiCard label="Average ticket" value={`₱${avgOrderValue.toLocaleString('en-PH')}`} hint="Per receipt" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel padded className="space-y-3">
          <h2 className="text-[15px] font-semibold text-brown-900">Sales by channel</h2>
          <div className="space-y-2 text-[13px]">
            {channelStats.map((ch) => (
              <div key={ch.type} className="space-y-1">
                <div className="flex justify-between">
                  <span className="capitalize">{ch.type.replace('-', ' ')} ({ch.count} orders)</span>
                  <span className="font-semibold">₱{ch.total.toLocaleString()} ({ch.percentOfSales.toFixed(1)}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                  <div style={{ width: `${ch.percentOfSales}%` }} className="h-full rounded-full bg-brown-700" />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel padded className="space-y-3">
          <h2 className="text-[15px] font-semibold text-brown-900">Sales by payment method</h2>
          <div className="space-y-2 text-[13px]">
            {paymentStats.map((p) => (
              <div key={p.method} className="space-y-1">
                <div className="flex justify-between">
                  <span>{p.method} ({p.count} transactions)</span>
                  <span className="font-semibold">₱{p.total.toLocaleString()} ({p.percent.toFixed(1)}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                  <div style={{ width: `${p.percent}%` }} className="h-full rounded-full bg-brown-700" />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="border-b border-stone-300 px-4 py-3">
          <h2 className="text-[15px] font-semibold text-brown-900">Best sellers</h2>
        </div>
        {topItems.length === 0 ? (
          <EmptyState title="No sales yet" hint="Best sellers appear after the first order." />
        ) : (
          <Table>
            <TableHeader className="bg-stone-100">
              <TableRow className="text-[12px] font-semibold text-stone-700">
                <TableHead className="py-2.5 px-4">Item</TableHead>
                <TableHead className="py-2.5 px-3">Category</TableHead>
                <TableHead className="py-2.5 px-3 text-right">Sold</TableHead>
                <TableHead className="py-2.5 pr-4 pl-3 text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topItems.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="py-2.5 px-4 text-[13px] font-semibold text-brown-900">{item.name}</TableCell>
                  <TableCell className="py-2.5 px-3 text-[13px] text-stone-700">{item.category}</TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-[13px] font-semibold text-brown-900">{item.qty}</TableCell>
                  <TableCell className="py-2.5 pr-4 pl-3 text-right text-[13px] font-semibold text-brown-900">
                    ₱{item.revenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
};
