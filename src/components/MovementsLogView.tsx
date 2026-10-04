import React, { useState, useMemo } from 'react';
import { StockMovementLog } from '../types/inventory';
import { Search, ArrowDownRight, ArrowUpRight, CheckSquare, History } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './ui/table';
import { Input } from './ui/input';

interface MovementsLogViewProps {
  logs: StockMovementLog[];
  onClearLogs?: () => void;
}

export const MovementsLogView: React.FC<MovementsLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            log.itemName.toLowerCase().includes(q) ||
            log.itemSku.toLowerCase().includes(q) ||
            log.actor.toLowerCase().includes(q) ||
            log.reason.toLowerCase().includes(q) ||
            (log.notes && log.notes.toLowerCase().includes(q));
          if (!match) return false;
        }

        if (typeFilter !== 'all' && log.type !== typeFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchQuery, typeFilter]);

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-neutral-200 rounded-md">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Stock Movement Audit Ledger</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Immutable chronological log of all stock receipts, dispatches, write-offs, and cycle recounts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono tabular-nums">
          <History className="w-4 h-4 text-neutral-400" />
          <span>{logs.length} logged events</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-neutral-200 rounded-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions by item, SKU, reason, or operator..."
            className="pl-9 pr-3 h-8 text-xs"
          />
        </div>

        {/* Type Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md shrink-0 text-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
              typeFilter === 'all'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setTypeFilter('in')}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
              typeFilter === 'in'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Receipts (+)
          </button>
          <button
            onClick={() => setTypeFilter('out')}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
              typeFilter === 'out'
                ? 'bg-white text-rose-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Dispatches (-)
          </button>
          <button
            onClick={() => setTypeFilter('adjustment')}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
              typeFilter === 'adjustment'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Audits & Adjustments
          </button>
        </div>
      </div>

      {/* Audit Table using shadcn Table */}
      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-neutral-50/80">
            <TableRow className="border-b border-neutral-200 text-neutral-600 uppercase tracking-wider font-semibold text-[11px]">
              <TableHead className="py-2.5 pl-4 pr-3 whitespace-nowrap">Timestamp</TableHead>
              <TableHead className="py-2.5 px-3 whitespace-nowrap">Item & SKU</TableHead>
              <TableHead className="py-2.5 px-3 whitespace-nowrap">Movement Type</TableHead>
              <TableHead className="py-2.5 px-3 text-right whitespace-nowrap">Delta</TableHead>
              <TableHead className="py-2.5 px-3 text-right whitespace-nowrap">Prev → New</TableHead>
              <TableHead className="py-2.5 px-3 whitespace-nowrap">Reason & Notes</TableHead>
              <TableHead className="py-2.5 pr-4 pl-3 whitespace-nowrap text-right">Recorded By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-neutral-500">
                  <p className="text-sm font-medium text-neutral-800">No activity logs recorded</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Stock adjustments, receipts, and order dispatches will appear here.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                return (
                  <TableRow key={log.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Timestamp */}
                    <TableCell className="py-2.5 pl-4 pr-3 font-mono tabular-nums text-neutral-600 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>

                    {/* Item SKU & Name */}
                    <TableCell className="py-2.5 px-3">
                      <div className="font-medium text-neutral-900 leading-tight">
                        {log.itemName}
                      </div>
                      <div className="font-mono text-[11px] text-neutral-500 mt-0.5">
                        {log.itemSku}
                      </div>
                    </TableCell>

                    {/* Movement Type */}
                    <TableCell className="py-2.5 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-medium">
                        {log.type === 'in' ? (
                          <span className="text-emerald-700 inline-flex items-center gap-1">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Stock In
                          </span>
                        ) : log.type === 'out' ? (
                          <span className="text-rose-700 inline-flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Stock Out
                          </span>
                        ) : (
                          <span className="text-neutral-700 inline-flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5" /> Audit Recount
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Quantity Delta */}
                    <TableCell className="py-2.5 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap text-sm">
                      <span
                        className={
                          log.quantityDelta > 0
                            ? 'text-emerald-700'
                            : log.quantityDelta < 0
                            ? 'text-rose-700'
                            : 'text-neutral-700'
                        }
                      >
                        {log.quantityDelta > 0 ? `+${log.quantityDelta}` : log.quantityDelta}
                      </span>
                    </TableCell>

                    {/* Prev -> New Stock */}
                    <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-600 whitespace-nowrap text-xs">
                      <span>{log.previousStock}</span>
                      <span className="mx-1 text-neutral-400">→</span>
                      <span className="font-semibold text-neutral-900">{log.newStock}</span>
                    </TableCell>

                    {/* Reason & Notes */}
                    <TableCell className="py-2.5 px-3">
                      <span className="font-medium text-neutral-900">{log.reason}</span>
                      {log.notes && (
                        <p className="text-[11px] text-neutral-500 mt-0.5">{log.notes}</p>
                      )}
                    </TableCell>

                    {/* Actor */}
                    <TableCell className="py-2.5 pr-4 pl-3 text-right text-neutral-600 whitespace-nowrap">
                      {log.actor || 'System'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
