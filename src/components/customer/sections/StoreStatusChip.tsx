import React, { useEffect, useState } from 'react';
import { STORE_INFO } from '../../../data/allMyTeaData';
import { getStoreStatus } from '../../../lib/storeHours';

export const StoreStatusChip: React.FC = () => {
  const [status, setStatus] = useState(() => getStoreStatus(new Date(), STORE_INFO.schedule));
  useEffect(() => {
    const id = window.setInterval(() => setStatus(getStoreStatus(new Date(), STORE_INFO.schedule)), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brown-700/30 bg-white/60 px-3 py-1 text-[13px] font-semibold text-brown-900">
      <span className={`h-2 w-2 rounded-full ${status.open ? 'bg-status-ready' : 'bg-status-danger'}`} aria-hidden />
      {status.label}
    </span>
  );
};
