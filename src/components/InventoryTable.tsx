import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types/inventory';
import {
  Search,
  Filter,
  ArrowUpDown,
  Barcode,
  Edit,
  Trash2,
  ArrowRightLeft,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface InventoryTableProps {
  items: InventoryItem[];
  onOpenDetail: (item: InventoryItem) => void;
  onOpenAdjust: (item: InventoryItem) => void;
  onOpenEdit: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onBulkDelete: (itemIds: string[]) => void;
  onOpenAddItem: () => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

type SortField = 'name' | 'sku' | 'stock' | 'valuation' | 'category' | 'lastUpdated';
type SortOrder = 'asc' | 'desc';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onOpenDetail,
  onOpenAdjust,
  onOpenEdit,
  onDeleteItem,
  onBulkDelete,
  onOpenAddItem,
  statusFilter,
  setStatusFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category))).sort();
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            item.name.toLowerCase().includes(q) ||
            item.sku.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.location.toLowerCase().includes(q) ||
            item.supplier.toLowerCase().includes(q);
          if (!match) return false;
        }

        if (categoryFilter !== 'all' && item.category !== categoryFilter) {
          return false;
        }

        if (statusFilter === 'low_stock') {
          return item.stock > 0 && item.stock <= item.minThreshold;
        }
        if (statusFilter === 'out_of_stock') {
          return item.stock === 0;
        }
        if (statusFilter === 'in_stock') {
          return item.stock > item.minThreshold;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        if (sortField === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortField === 'sku') {
          valA = a.sku.toLowerCase();
          valB = b.sku.toLowerCase();
        } else if (sortField === 'category') {
          valA = a.category.toLowerCase();
          valB = b.category.toLowerCase();
        } else if (sortField === 'stock') {
          valA = a.stock;
          valB = b.stock;
        } else if (sortField === 'valuation') {
          valA = a.stock * a.unitCost;
          valB = b.stock * b.unitCost;
        } else if (sortField === 'lastUpdated') {
          valA = new Date(a.lastUpdated).getTime();
          valB = new Date(b.lastUpdated).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [items, searchQuery, categoryFilter, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirmBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete ${selectedIds.length} selected items?`
      )
    ) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Category Filter, Status Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white border border-neutral-200 rounded-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input using shadcn Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, name, aisle, supplier..."
              className="pl-9 pr-8 h-8 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 px-2.5 text-xs border border-neutral-300 rounded-md bg-white text-neutral-700 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            >
              <option value="all">All Categories ({items.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c} ({items.filter((i) => i.category === c).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md shrink-0 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStatusFilter('in_stock')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              statusFilter === 'in_stock'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Healthy
          </button>
          <button
            onClick={() => setStatusFilter('low_stock')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              statusFilter === 'low_stock'
                ? 'bg-white text-amber-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setStatusFilter('out_of_stock')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              statusFilter === 'out_of_stock'
                ? 'bg-white text-rose-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Stockout
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-2.5 bg-neutral-900 text-white rounded-md text-xs px-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold tabular-nums">{selectedIds.length}</span>
            <span>items selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 text-neutral-300 hover:text-white transition-colors"
            >
              Deselect All
            </button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmBulkDelete}
              className="h-7 text-xs inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main High-Density Table using shadcn Table */}
      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-neutral-50/80">
            <TableRow className="border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <TableHead className="py-2.5 pl-4 pr-2 w-8">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length > 0 && selectedIds.length === filteredItems.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort('sku')}
                className="py-2.5 px-3 cursor-pointer hover:text-neutral-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>SKU</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('name')}
                className="py-2.5 px-3 cursor-pointer hover:text-neutral-900 select-none min-w-[200px]"
              >
                <div className="flex items-center gap-1">
                  <span>Item & Details</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('category')}
                className="py-2.5 px-3 cursor-pointer hover:text-neutral-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('stock')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-neutral-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Stock Level</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </TableHead>
              <TableHead className="py-2.5 px-3 text-right whitespace-nowrap">Unit Cost</TableHead>
              <TableHead
                onClick={() => handleSort('valuation')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-neutral-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Holding Value</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </TableHead>
              <TableHead className="py-2.5 px-3 whitespace-nowrap">Location</TableHead>
              <TableHead className="py-2.5 pr-4 pl-3 text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-neutral-500">
                  <p className="text-sm font-medium text-neutral-800">No inventory items found</p>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try clearing active filters or searching with a different SKU or keyword.'
                      : 'Your inventory is currently empty. Start tracking stock by creating your first item.'}
                  </p>
                  <Button
                    size="sm"
                    onClick={onOpenAddItem}
                    className="mt-4"
                  >
                    + Create First Item
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isLow = item.stock > 0 && item.stock <= item.minThreshold;
                const isOut = item.stock === 0;
                const holdingVal = item.stock * item.unitCost;

                return (
                  <TableRow
                    key={item.id}
                    className={`hover:bg-neutral-50/80 transition-colors group ${
                      isSelected ? 'bg-neutral-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <TableCell className="py-2 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                      />
                    </TableCell>

                    {/* SKU */}
                    <TableCell className="py-2 px-3 whitespace-nowrap">
                      <button
                        onClick={() => onOpenDetail(item)}
                        className="font-mono font-semibold text-neutral-800 hover:text-neutral-950 underline decoration-neutral-300 hover:decoration-neutral-900 transition-colors text-left"
                      >
                        {item.sku}
                      </button>
                    </TableCell>

                    {/* Name & Quick Metadata */}
                    <TableCell className="py-2 px-3">
                      <div className="font-medium text-neutral-900 leading-tight">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="hover:underline text-left text-neutral-900"
                        >
                          {item.name}
                        </button>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                        <span>Supplier: {item.supplier || 'Standard'}</span>
                        <span aria-hidden="true">·</span>
                        <span>Retail: ${item.unitPrice.toFixed(2)}</span>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-2 px-3 whitespace-nowrap text-neutral-600">
                      {item.category}
                    </TableCell>

                    {/* Stock Level */}
                    <TableCell className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-mono font-bold text-sm tabular-nums ${
                            isOut
                              ? 'text-rose-700'
                              : isLow
                              ? 'text-amber-700'
                              : 'text-neutral-900'
                          }`}
                        >
                          {item.stock}{' '}
                          <span className="text-[11px] font-normal text-neutral-500">
                            {item.unit || 'pcs'}
                          </span>
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono tabular-nums">
                          {isOut
                            ? 'Stockout (Alert)'
                            : isLow
                            ? `Low (Min ${item.minThreshold})`
                            : `Min ${item.minThreshold}`}
                        </span>
                      </div>
                    </TableCell>

                    {/* Unit Cost */}
                    <TableCell className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                      ${item.unitCost.toFixed(2)}
                    </TableCell>

                    {/* Total Holding Valuation */}
                    <TableCell className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900 whitespace-nowrap">
                      ${holdingVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>

                    {/* Location */}
                    <TableCell className="py-2 px-3 text-neutral-600 text-xs whitespace-nowrap">
                      {item.location}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2 pr-4 pl-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenAdjust(item)}
                          title="Quick Adjust Stock (+/-)"
                          className="h-7 w-7 text-neutral-600 hover:text-neutral-950"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenDetail(item)}
                          title="View Barcode & Details"
                          className="h-7 w-7 text-neutral-600 hover:text-neutral-950"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenEdit(item)}
                          title="Edit Item Specs"
                          className="h-7 w-7 text-neutral-600 hover:text-neutral-950"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm(`Delete item "${item.name}" (${item.sku})?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          title="Delete Item"
                          className="h-7 w-7 text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-neutral-50/60 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
          <div>
            <span>Showing</span>{' '}
            <span className="font-semibold text-neutral-800 font-mono tabular-nums">
              {filteredItems.length}
            </span>{' '}
            <span>of</span>{' '}
            <span className="font-semibold text-neutral-800 font-mono tabular-nums">
              {items.length}
            </span>{' '}
            <span>catalog items</span>
          </div>

          <div className="text-right">
            <span>Filtered stock valuation:</span>{' '}
            <span className="font-mono font-bold text-neutral-900 tabular-nums">
              $
              {filteredItems
                .reduce((acc, i) => acc + i.stock * i.unitCost, 0)
                .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
