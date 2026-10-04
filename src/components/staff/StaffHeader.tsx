import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { StaffTab } from '../../hooks/useRoute';
import { logo } from '@/src/assets/images';
import { Button } from '../ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';

interface StaffHeaderProps {
  tab: StaffTab;
  onNavigate: (tab: StaffTab) => void;
  onGoHome: () => void;
  pendingCount: number;
  lowStockCount: number;
  cashierName: string;
  onReset: () => void;
  onSignOut: () => void;
}

const TABS: { id: StaffTab; label: string }[] = [
  { id: 'pos', label: 'POS' },
  { id: 'kds', label: 'Kitchen' },
  { id: 'inventory', label: 'Stock' },
  { id: 'orders', label: 'Orders' },
  { id: 'analytics', label: 'Reports' },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  tab, onNavigate, onGoHome, pendingCount, lowStockCount, cashierName, onReset, onSignOut,
}) => {
  const time = useClock();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the overflow menu on an outside tap or Escape. Tablets never fire mouseleave,
  // so the only other way out would be one of the two destructive items.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const countFor = (id: StaffTab) => (id === 'kds' ? pendingCount : id === 'inventory' ? lowStockCount : 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-300">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onGoHome} className="flex items-center gap-2.5 shrink-0" title="Open the customer page">
          <img src={logo} alt="" className="h-8 w-8 rounded-full" />
          <span className="text-[15px] font-bold text-brown-900">AllmyTea <span className="font-medium text-stone-700">Staff</span></span>
        </button>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Staff screens">
          {TABS.map(({ id, label }) => {
            const active = tab === id;
            const count = countFor(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-control px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  active ? 'bg-brown-700 text-white' : 'text-stone-700 hover:bg-stone-100 hover:text-brown-900'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 text-[11px] font-bold ${active ? 'bg-white/20 text-white' : id === 'kds' ? 'bg-brand-500 text-brown-900' : 'bg-status-danger text-white'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden text-right text-[12px] leading-tight sm:block">
          <div className="font-semibold text-brown-900">{cashierName}</div>
          <div className="text-stone-500">{time}</div>
        </div>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="More"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 mt-1 w-44 rounded-control border border-stone-300 bg-white py-1 shadow-lg">
              <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left text-[13px] hover:bg-stone-100" onClick={() => { setMenuOpen(false); setConfirmReset(true); }}>
                Reset demo data
              </button>
              <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left text-[13px] hover:bg-stone-100" onClick={() => { setMenuOpen(false); onSignOut(); }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset demo data?</DialogTitle>
            <DialogDescription>Menu, stock, orders, and movements go back to the sample set. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>Keep my data</Button>
            <Button variant="destructive" onClick={() => { setConfirmReset(false); onReset(); }}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};
