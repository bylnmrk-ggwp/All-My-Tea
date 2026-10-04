import React, { useState } from 'react';
import { Order } from '../../types/allmytea';
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
import { Search, Download, Printer } from 'lucide-react';
import { PageHeader } from '../staff/PageHeader';
import { Panel } from '../staff/Panel';
import { StatusBadge } from '../staff/StatusBadge';
import { EmptyState } from '../staff/EmptyState';
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
      <PageHeader
        title="Orders"
        description="Every ticket and receipt."
        actions={
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <Panel padded className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order number, name, phone, or item"
            className="pl-9"
            aria-label="Search orders"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Channel"
            className="h-9 rounded-control border border-stone-300 bg-white px-2.5 text-[13px]"
          >
            <option value="all">All channels</option>
            <option value="dine-in">Dine in</option>
            <option value="take-out">Take out</option>
            <option value="delivery">Delivery</option>
            <option value="pick-up">Pick up</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Status"
            className="h-9 rounded-control border border-stone-300 bg-white px-2.5 text-[13px]"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </Panel>

      {/* Orders table */}
      <Panel>
        <Table>
          <TableHeader className="bg-stone-100">
            <TableRow className="text-[12px] font-semibold text-stone-700">
              <TableHead className="py-2.5 px-4">Order</TableHead>
              <TableHead className="py-2.5 px-3">Date</TableHead>
              <TableHead className="py-2.5 px-3">Channel</TableHead>
              <TableHead className="py-2.5 px-3">Customer</TableHead>
              <TableHead className="py-2.5 px-3">Items</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Total</TableHead>
              <TableHead className="py-2.5 px-3">Payment</TableHead>
              <TableHead className="py-2.5 px-3">Status</TableHead>
              <TableHead className="py-2.5 pr-4 pl-3 text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="p-0">
                  <EmptyState title="No orders match" hint="Change the filters or search for something else." />
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const totalItemCount = order.items.reduce((a, b) => a + b.quantity, 0);

                return (
                  <TableRow key={order.id}>
                    <TableCell className="py-2.5 px-4 font-mono font-semibold text-brown-900 text-[13px]">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-[12px] text-stone-700 whitespace-nowrap">
                      {new Date(order.timestamp).toLocaleString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-[13px] text-stone-700 capitalize whitespace-nowrap">
                      {order.type.replace('-', ' ')}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-[13px] text-brown-900">
                      {order.tableNumber || order.customerName || 'Walk-in'}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-[13px] text-stone-700 max-w-[200px] truncate">
                      {totalItemCount} items: {order.items.map((i) => i.name).join(', ')}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right text-[13px] font-semibold text-brown-900">
                      ₱{order.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-[13px] text-stone-700 whitespace-nowrap">
                      {order.paymentMethod}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="py-2.5 pr-4 pl-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrderForReceipt(order)}>
                        <Printer className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Panel>

      <ReceiptModal
        order={selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
      />
    </div>
  );
};
