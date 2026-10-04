import React from 'react';
import { cn } from '@/src/lib/utils';
import { Panel } from './Panel';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'warn' | 'good';
}

const toneClass: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'text-brown-900',
  warn: 'text-brown-700',
  good: 'text-status-ready',
};

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, hint, tone = 'default' }) => (
  <Panel padded>
    <p className="text-[13px] text-stone-700">{label}</p>
    <p className={cn('mt-1 text-[30px] font-bold leading-none', toneClass[tone])}>{value}</p>
    {hint && <p className="mt-2 text-[13px] text-stone-500">{hint}</p>}
  </Panel>
);
