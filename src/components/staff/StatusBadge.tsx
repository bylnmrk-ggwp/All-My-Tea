import React from 'react';
import type { OrderStatus, StockMovement } from '../../types/allmytea';

type Status = OrderStatus | StockMovement['type'] | 'low';

// Status hues come from the @theme tokens in index.css so badges, KDS borders,
// and KPI tones read as one system.
const STYLES: Record<Status, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-status-pending/20 text-brown-700' },
  preparing:  { label: 'Preparing',  className: 'bg-status-preparing/15 text-status-preparing' },
  ready:      { label: 'Ready',      className: 'bg-status-ready/15 text-status-ready' },
  completed:  { label: 'Completed',  className: 'bg-stone-100 text-stone-700' },
  cancelled:  { label: 'Cancelled',  className: 'bg-status-danger/15 text-status-danger' },
  in:         { label: 'Stock in',   className: 'bg-status-ready/15 text-status-ready' },
  out:        { label: 'Used',       className: 'bg-stone-100 text-stone-700' },
  spoilage:   { label: 'Waste',      className: 'bg-status-danger/15 text-status-danger' },
  adjustment: { label: 'Adjusted',   className: 'bg-status-preparing/15 text-status-preparing' },
  low:        { label: 'Low',        className: 'bg-status-pending/20 text-brown-700' },
};

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
};
