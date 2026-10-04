import React from 'react';

interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, hint, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
    <p className="text-[15px] font-semibold text-brown-900">{title}</p>
    {hint && <p className="max-w-xs text-[13px] text-stone-700">{hint}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
