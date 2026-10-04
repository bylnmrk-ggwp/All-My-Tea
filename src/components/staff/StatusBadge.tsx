import React from 'react';
import type { OrderStatus, StockMovement } from '../../types/allmytea';

type Status = OrderStatus | StockMovement['type'] | 'low';

const STYLES: Record<Status, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-brand-500/20 text-brown-700' },
  preparing:  { label: 'Preparing',  className: 'bg-blue-100 text-blue-800' },
  ready:      { label: 'Ready',      className: 'bg-green-100 text-green-800' },
  completed:  { label: 'Completed',  className: 'bg-stone-100 text-stone-700' },
  cancelled:  { label: 'Cancelled',  className: 'bg-red-100 text-red-800' },
  in:         { label: 'Stock in',   className: 'bg-green-100 text-green-800' },
  out:        { label: 'Used',       className: 'bg-stone-100 text-stone-700' },
  spoilage:   { label: 'Waste',      className: 'bg-red-100 text-red-800' },
  adjustment: { label: 'Adjusted',   className: 'bg-blue-100 text-blue-800' },
  low:        { label: 'Low',        className: 'bg-brand-500/20 text-brown-700' },
};

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
};
