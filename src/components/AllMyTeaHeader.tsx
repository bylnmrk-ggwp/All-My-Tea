import React from 'react';
import { AppTab } from '../types/allmytea';
import { STORE_INFO } from '../data/allMyTeaData';
import { Globe, ShoppingBag, UtensilsCrossed, Package, Receipt, BarChart3, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface AllMyTeaHeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  pendingOrdersCount: number;
  lowIngredientsCount: number;
  onResetData: () => void;
  cashierName: string;
}

export const AllMyTeaHeader: React.FC<AllMyTeaHeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingOrdersCount,
  lowIngredientsCount,
  onResetData,
  cashierName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src="/src/assets/images/allmytea_logo_badge_1791083133659.jpg"
            alt="All My Tea Logo"
            className="w-10 h-10 rounded-full object-cover border border-amber-200 shadow-2xs group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-neutral-900 leading-none group-hover:text-amber-800 transition-colors">
                AllmyTea
              </span>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 leading-none">
                Maysilo, Malabon
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5 hidden sm:block">
              Burger · Milktea · Ramen · Sushi & Sizzling
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200/80 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'landing'
                ? 'bg-amber-800 text-white shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Customer Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pos'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
            <span>POS Register</span>
          </button>

          <button
            onClick={() => setActiveTab('kds')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kds'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-rose-600" />
            <span>Kitchen Display</span>
            {pendingOrdersCount > 0 && (
              <span className="font-mono text-[11px] bg-rose-600 text-white rounded-full px-1.5 py-0.2 font-bold tabular-nums">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            title={
              lowIngredientsCount > 0
                ? `Low stock alert: ${lowIngredientsCount} item(s) below reorder threshold!`
                : 'Inventory & Supplies'
            }
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap relative ${
              activeTab === 'inventory'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : lowIngredientsCount > 0
                ? 'text-rose-900 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-300'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Inventory</span>
            {lowIngredientsCount > 0 && (
              <span className="flex items-center gap-1 font-mono text-[10px] bg-rose-600 text-white rounded-full px-1.5 py-0.5 font-bold tabular-nums shadow-xs animate-pulse">
                <AlertTriangle className="w-2.5 h-2.5 text-white" />
                <span>{lowIngredientsCount} Low</span>
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span>Orders History</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Sales & Reports</span>
          </button>
        </nav>

        {/* Cashier Info & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex flex-col text-right text-xs">
            <span className="font-medium text-neutral-800">{cashierName}</span>
            <span className="text-[10px] text-neutral-500">Cashier on Duty</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onResetData}
            title="Reset to store default demo data"
            className="text-neutral-500 hover:text-neutral-900"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
