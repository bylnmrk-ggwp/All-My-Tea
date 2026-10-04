import React from 'react';
import { Plus, Download, Upload, RotateCcw, Package } from 'lucide-react';
import { ActiveTab } from '../types/inventory';
import { Button } from './ui/button';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddItem: () => void;
  onExportCsv: () => void;
  onOpenImportCsv: () => void;
  onResetData: () => void;
  totalItemsCount: number;
  lowStockCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddItem,
  onExportCsv,
  onOpenImportCsv,
  onResetData,
  totalItemsCount,
  lowStockCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center text-white shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <a
            href="#inventory"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('inventory');
            }}
            className="text-lg font-semibold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors whitespace-nowrap"
          >
            InvenTrak
          </a>
        </div>

        {/* Zone 2: 4 clean text navigation links / segmented controls */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1 bg-neutral-100/90 rounded-md border border-neutral-200/80 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Inventory ({totalItemsCount})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${
              activeTab === 'movements'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Audit Movements
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reorder'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <span>Reorder Queue</span>
            {lowStockCount > 0 && (
              <span className="font-mono text-xs text-amber-700 font-semibold tabular-nums">
                ({lowStockCount})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Analytics & Valuation
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenImportCsv}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onResetData}
            title="Reset to sample catalog"
            className="hidden lg:inline-flex text-neutral-500 hover:text-neutral-900"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            onClick={onOpenAddItem}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

