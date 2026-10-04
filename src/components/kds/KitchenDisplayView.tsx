import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/allmytea';
import { Clock, CheckCircle, Utensils, Coffee, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface KitchenDisplayViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  orders,
  onUpdateOrderStatus,
}) => {
  const [stationFilter, setStationFilter] = useState<'All' | 'Drinks' | 'Kitchen'>('All');

  // Filter orders by active status
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'completed').slice(0, 5);

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
      {/* KDS Header & Station Filter */}
      <div className="p-4 bg-white border border-neutral-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-800" />
            <span>Kitchen & Barista Display System (KDS)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Live queue for order preparation, drink assembly, and meal dispatch.
          </p>
        </div>

        {/* Station Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-md text-xs font-medium">
          <button
            onClick={() => setStationFilter('All')}
            className={`px-3 py-1 rounded transition-colors ${
              stationFilter === 'All'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Stations
          </button>
          <button
            onClick={() => setStationFilter('Drinks')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
              stationFilter === 'Drinks'
                ? 'bg-white text-amber-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Coffee className="w-3 h-3" />
            <span>Barista / Drinks</span>
          </button>
          <button
            onClick={() => setStationFilter('Kitchen')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
              stationFilter === 'Kitchen'
                ? 'bg-white text-rose-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Utensils className="w-3 h-3" />
            <span>Burger & Ramen Grill</span>
          </button>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Column 1: Pending */}
        <div className="space-y-3">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>New Tickets ({pendingOrders.length})</span>
            </div>
            <span className="text-[11px] text-amber-700">Waiting to prepare</span>
          </div>

          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 bg-white border border-neutral-200 rounded-lg">
                No new pending orders
              </div>
            ) : (
              pendingOrders.map((order) => {
                const visibleItems = getFilteredItems(order);
                if (visibleItems.length === 0) return null;

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-white border-2 border-amber-300 rounded-lg shadow-xs space-y-3"
                  >
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between border-b border-neutral-100 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-bold text-neutral-900">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {order.type}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 font-medium mt-0.5">
                          {order.tableNumber || order.customerName || 'Walk-in'}
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>{getElapsedTime(order.timestamp)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 text-xs divide-y divide-neutral-100">
                      {visibleItems.map((item, idx) => (
                        <div key={idx} className="pt-1.5 first:pt-0">
                          <div className="font-bold text-neutral-900 flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              {item.category}
                            </span>
                          </div>

                          {/* Customizations */}
                          <div className="text-[11px] text-neutral-600 pl-2 mt-0.5 space-y-0.5">
                            {item.customization.size && (
                              <span className="font-semibold text-neutral-800">
                                [{item.customization.size}]{' '}
                              </span>
                            )}
                            {item.customization.sugarLevel && (
                              <span>{item.customization.sugarLevel} sugar · {item.customization.iceLevel}</span>
                            )}
                            {item.customization.spiciness && (
                              <span className="text-rose-700 font-semibold block">
                                Spice: {item.customization.spiciness}
                              </span>
                            )}
                            {item.customization.addons && item.customization.addons.length > 0 && (
                              <span className="text-amber-800 font-semibold block">
                                + {item.customization.addons.map((a) => a.name).join(', ')}
                              </span>
                            )}
                            {item.customization.specialInstructions && (
                              <span className="italic text-neutral-700 bg-yellow-50 px-1 rounded block mt-0.5">
                                Note: {item.customization.specialInstructions}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                      className="w-full bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Start Preparing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>In Preparation ({preparingOrders.length})</span>
            </div>
            <span className="text-[11px] text-blue-700">Currently cooking/brewing</span>
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 bg-white border border-neutral-200 rounded-lg">
                No orders currently in prep
              </div>
            ) : (
              preparingOrders.map((order) => {
                const visibleItems = getFilteredItems(order);
                if (visibleItems.length === 0) return null;

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-white border-2 border-blue-300 rounded-lg shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between border-b border-neutral-100 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-bold text-neutral-900">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {order.type}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 font-medium mt-0.5">
                          {order.tableNumber || order.customerName || 'Walk-in'}
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-blue-700 flex items-center gap-1 font-mono font-medium">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span>{getElapsedTime(order.timestamp)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 text-xs divide-y divide-neutral-100">
                      {visibleItems.map((item, idx) => (
                        <div key={idx} className="pt-1.5 first:pt-0">
                          <div className="font-bold text-neutral-900 flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              {item.category}
                            </span>
                          </div>

                          <div className="text-[11px] text-neutral-600 pl-2 mt-0.5 space-y-0.5">
                            {item.customization.size && (
                              <span className="font-semibold text-neutral-800">
                                [{item.customization.size}]{' '}
                              </span>
                            )}
                            {item.customization.sugarLevel && (
                              <span>{item.customization.sugarLevel} sugar · {item.customization.iceLevel}</span>
                            )}
                            {item.customization.spiciness && (
                              <span className="text-rose-700 font-semibold block">
                                Spice: {item.customization.spiciness}
                              </span>
                            )}
                            {item.customization.addons && item.customization.addons.length > 0 && (
                              <span className="text-amber-800 font-semibold block">
                                + {item.customization.addons.map((a) => a.name).join(', ')}
                              </span>
                            )}
                            {item.customization.specialInstructions && (
                              <span className="italic text-neutral-700 bg-yellow-50 px-1 rounded block mt-0.5">
                                Note: {item.customization.specialInstructions}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Ready for Serving / Pick-up</span>
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pick-up / Delivery */}
        <div className="space-y-3">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Ready for Dispatch ({readyOrders.length})</span>
            </div>
            <span className="text-[11px] text-emerald-700">Serve to customer</span>
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 bg-white border border-neutral-200 rounded-lg">
                No orders waiting for pickup
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-white border-2 border-emerald-300 rounded-lg shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between border-b border-neutral-100 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-neutral-900">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {order.type}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-700 font-semibold mt-0.5">
                        {order.tableNumber || order.customerName || 'Customer Counter'}
                      </div>
                      {order.deliveryAddress && (
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Delivery: {order.deliveryAddress}
                        </p>
                      )}
                    </div>

                    <span className="font-mono font-bold text-xs text-emerald-700">
                      ₱{order.total}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-600 space-y-1">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{i.quantity}x {i.name}</span>
                        <span className="text-neutral-400 font-mono">
                          {i.customization.size || ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Mark Fulfilled / Done</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
