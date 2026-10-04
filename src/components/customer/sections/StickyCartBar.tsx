import React from 'react';
import { Button } from '../../ui/button';

interface StickyCartBarProps {
  count: number;
  total: number;
  onReview: () => void;
}

export const StickyCartBar: React.FC<StickyCartBarProps> = ({ count, total, onReview }) => {
  if (count === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-300 bg-white p-3 shadow-[0_-8px_24px_rgba(43,27,16,0.12)] md:hidden">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3">
        <span className="text-[15px] font-semibold text-brown-900">
          {count} {count === 1 ? 'item' : 'items'}, ₱{total.toLocaleString('en-PH')}
        </span>
        <Button onClick={onReview}>Review order</Button>
      </div>
    </div>
  );
};
