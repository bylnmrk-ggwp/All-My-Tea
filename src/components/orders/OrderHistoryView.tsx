import React, { useState } from 'react';
import { Order, OrderStatus, OrderType } from '../../types/allmytea';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, Printer, Filter } from 'lucide-react';
import { ReceiptModal } from '../pos/ReceiptModal';

interface OrderHistoryViewProps {
  orders: Order[];
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (typeFilter !== 'all' && o.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.tableNumber && o.tableNumber.toLowerCase().includes(q)) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = ['Order Number', 'Date', 'Type', 'Customer / Table', 'Total (PHP)', 'Payment', 'Status', 'Cashier'];
    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.timestamp).toLocaleString()}"`,
      `"${o.type}"`,
      `"${o.tableNumber || o.customerName || 'Walk-in'}"`,
      o.total,
      `"${o.paymentMethod}"`,
      `"${o.status}"`,
      `"${o.cashier}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `allmytea_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="p-4 bg-white border border-neutral-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900">All My Tea Orders & Sales History</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Log of customer receipts, payments, and dining tickets.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCsv} className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1" />
          Export Orders CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white border border-neutral-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #AMT, customer name, mobile, or item..."
            className="pl-9 h-8 text-xs bg-neutral-50/50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 px-2.5 text-xs border border-neutral-300 rounded bg-white"
          >
            <option value="all">All Channels</option>
            <option value="dine-in">Dine-In</option>
            <option value="take-out">Take-Out</option>
            <option value="delivery">Delivery</option>
            <option value="pick-up">Pick-Up</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs border border-neutral-300 rounded bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50/80">
            <TableRow className="border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <TableHead className="py-2.5 px-4">Order #</TableHead>
              <TableHead className="py-2.5 px-3">Date & Time</TableHead>
              <TableHead className="py-2.5 px-3">Channel / Type</TableHead>
              <TableHead className="py-2.5 px-3">Customer / Table</TableHead>
              <TableHead className="py-2.5 px-3">Items Summary</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Total Amount</TableHead>
              <TableHead className="py-2.5 px-3">Payment</TableHead>
              <TableHead className="py-2.5 px-3">Status</TableHead>
              <TableHead className="py-2.5 pr-4 pl-3 text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-neutral-500 text-xs">
                  No orders match your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const totalItemCount = order.items.reduce((a, b) => a + b.quantity, 0);

                return (
                  <TableRow key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                    <TableCell className="py-2.5 px-4 font-mono font-bold text-neutral-900 text-xs">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-[11px] text-neutral-600 font-mono">
                      {new Date(order.timestamp).toLocaleString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] font-semibold uppercase text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80">
                        {order.type}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-neutral-800">
                      {order.tableNumber || order.customerName || 'Walk-in'}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-neutral-600 max-w-[200px] truncate">
                      {totalItemCount}x ({order.items.map((i) => i.name).join(', ')})
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900 text-xs tabular-nums">
                      ₱{order.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-neutral-600 whitespace-nowrap">
                      {order.paymentMethod}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          order.status === 'completed'
                            ? 'bg-neutral-100 text-neutral-700'
                            : order.status === 'ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'preparing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 pr-4 pl-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedOrderForReceipt(order)}
                        className="h-7 text-xs px-2"
                        title="View / Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ReceiptModal
        order={selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
      />
    </div>
  );
};
