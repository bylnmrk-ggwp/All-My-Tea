import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../../types/allmytea';
import { Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { PageHeader } from '../staff/PageHeader';
import { Panel } from '../staff/Panel';
import { EmptyState } from '../staff/EmptyState';

interface KitchenDisplayViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

type ActiveStatus = 'pending' | 'preparing' | 'ready';

const COLUMNS: { status: ActiveStatus; title: string; hint: string; topBorder: string; emptyTitle: string }[] = [
  { status: 'pending',   title: 'New',       hint: 'Waiting to start',  topBorder: 'border-t-status-pending',   emptyTitle: 'No new tickets' },
  { status: 'preparing', title: 'Preparing', hint: 'On the line',       topBorder: 'border-t-status-preparing', emptyTitle: 'Nothing in progress' },
  { status: 'ready',     title: 'Ready',     hint: 'Serve or dispatch', topBorder: 'border-t-status-ready',     emptyTitle: 'Nothing waiting for pickup' },
];

const NEXT: Record<ActiveStatus, { status: OrderStatus; label: string; variant: 'default' | 'brand' }> = {
  pending:   { status: 'preparing', label: 'Start preparing', variant: 'default' },
  preparing: { status: 'ready',     label: 'Mark ready',      variant: 'default' },
  ready:     { status: 'completed', label: 'Complete',        variant: 'brand' },
};

const LEFT_BORDER: Record<ActiveStatus, string> = {
  pending: 'border-l-status-pending',
  preparing: 'border-l-status-preparing',
  ready: 'border-l-status-ready',
};

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  orders,
  onUpdateOrderStatus,
}) => {
  const [stationFilter, setStationFilter] = useState<'All' | 'Drinks' | 'Kitchen'>('All');

  // Ticket ages are computed from Date.now() during render; tick every 30 s so they advance.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const ordersFor = (status: OrderStatus) => orders.filter((o) => o.status === status);

  const getFilteredItems = (order: Order) => {
    if (stationFilter === 'All') return order.items;
    if (stationFilter === 'Drinks') {
      return order.items.filter((i) => i.category === 'Milk Tea & Coffee');
    }
    return order.items.filter(
      (i) =>
        i.category === 'Burgers' ||
        i.category === 'Ramen Overload' ||
        i.category === 'Sushi & Rolls' ||
        i.category === 'Sizzling & Chao Fan' ||
        i.category === 'Wings & Snacks'
    );
  };

  const getElapsedTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    return `${diffMins} mins ago`;
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kitchen display"
        description="Live queue for drinks, kitchen, and dispatch."
        actions={
          <div className="flex gap-1 rounded-control bg-stone-200 p-1 text-[12px]">
            {(['All', 'Drinks', 'Kitchen'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStationFilter(s)}
                aria-pressed={stationFilter === s}
                className={`rounded-control px-3 py-1 font-semibold ${stationFilter === s ? 'bg-white text-brown-900' : 'text-stone-700 hover:text-brown-900'}`}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-start">
        {COLUMNS.map((col) => {
          const list = ordersFor(col.status);
          const next = NEXT[col.status];
          return (
            <Panel key={col.status} className={`border-t-4 ${col.topBorder}`}>
              <div className="flex items-baseline justify-between border-b border-stone-300 px-4 py-3">
                <h2 className="text-[15px] font-semibold text-brown-900">
                  {col.title} <span className="text-stone-500">({list.length})</span>
                </h2>
                <span className="text-[12px] text-stone-500">{col.hint}</span>
              </div>
              <div className="space-y-3 p-3">
                {list.length === 0 && <EmptyState title={col.emptyTitle} />}
                {list.map((order) => {
                  const visibleItems = getFilteredItems(order);
                  if (visibleItems.length === 0) return null;
                  return (
                    <article
                      key={order.id}
                      className={`space-y-3 rounded-control border border-stone-300 border-l-4 ${LEFT_BORDER[col.status]} bg-white p-3`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono text-[22px] font-bold leading-none text-brown-900">{order.orderNumber}</div>
                          <div className="mt-1 text-[12px] text-stone-700 capitalize">
                            {order.type.replace('-', ' ')}, {order.tableNumber || order.customerName || 'Walk-in'}
                          </div>
                          {order.deliveryAddress && (
                            <div className="text-[12px] text-stone-700">Deliver to {order.deliveryAddress}</div>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[12px] text-stone-500">
                          <Clock className="h-3 w-3" />
                          {getElapsedTime(order.timestamp)}
                        </span>
                      </div>

                      <ul className="divide-y divide-stone-300 text-[13px]">
                        {visibleItems.map((item, idx) => (
                          <li key={idx} className="py-1.5 first:pt-0 last:pb-0">
                            <div className="flex justify-between font-semibold text-brown-900">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="text-[11px] font-normal text-stone-500">{item.category}</span>
                            </div>
                            <div className="mt-0.5 space-y-0.5 pl-2 text-[12px] text-stone-700">
                              {item.customization.size && (
                                <span className="font-semibold text-brown-900">{item.customization.size} </span>
                              )}
                              {item.customization.sugarLevel && (
                                <span>{item.customization.sugarLevel} sugar, {item.customization.iceLevel}</span>
                              )}
                              {item.customization.spiciness && (
                                <span className="block font-semibold text-status-danger">{item.customization.spiciness}</span>
                              )}
                              {item.customization.addons && item.customization.addons.length > 0 && (
                                <span className="block font-semibold text-brown-700">
                                  + {item.customization.addons.map((a) => a.name).join(', ')}
                                </span>
                              )}
                              {item.customization.specialInstructions && (
                                <span className="mt-0.5 block rounded-control bg-brand-500/20 px-1.5 py-0.5 italic text-brown-900">
                                  Note: {item.customization.specialInstructions}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>

                      <Button
                        size="sm"
                        variant={next.variant}
                        className="w-full"
                        onClick={() => onUpdateOrderStatus(order.id, next.status)}
                      >
                        {next.label}
                      </Button>
                    </article>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
};
