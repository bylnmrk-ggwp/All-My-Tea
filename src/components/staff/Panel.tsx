import React from 'react';
import { cn } from '@/src/lib/utils';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

/** White bordered surface. The only container staff views use. */
export const Panel: React.FC<PanelProps> = ({ padded = false, className, children, ...rest }) => (
  <div
    className={cn('bg-white border border-stone-300 rounded-panel overflow-hidden', padded && 'p-4', className)}
    {...rest}
  >
    {children}
  </div>
);
