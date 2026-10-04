import React, { useEffect, useState } from 'react';
import { Delete } from 'lucide-react';
import { STORE_INFO } from '../../data/allMyTeaData';
import { logo } from '@/src/assets/images';

const KEY = 'allmytea.staff';

export function isStaffUnlocked(): boolean {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function unlockStaff(): void {
  try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode: stay unlocked for this render only */ }
}
export function lockStaff(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* nothing to clear */ }
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const;

export const PinGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const press = (key: string) => {
    setError(false);
    if (key === 'back') return setPin((p) => p.slice(0, -1));
    if (!/^\d$/.test(key) || pin.length >= 4) return;
    setPin((p) => p + key);
  };

  useEffect(() => {
    if (pin.length !== 4) return;
    if (pin === STORE_INFO.staffPin) {
      unlockStaff();
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  }, [pin, onUnlock]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') press('back');
      else if (/^\d$/.test(e.key)) press(e.key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xs bg-white border border-stone-300 rounded-panel p-6 text-center">
        <img src={logo} alt="" className="mx-auto h-16 w-16 rounded-full" />
        <h1 className="mt-4 text-[22px] font-bold text-brown-900">Staff only</h1>
        <p className="mt-1 text-[13px] text-stone-700">Enter the 4-digit PIN.</p>

        <div className="mt-5 flex justify-center gap-3" aria-label="PIN entry" role="status">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full border ${i < pin.length ? 'bg-brown-700 border-brown-700' : 'border-stone-300'}`}
            />
          ))}
        </div>
        <p className={`mt-2 h-4 text-[13px] text-status-danger ${error ? '' : 'invisible'}`}>Wrong PIN</p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {KEYS.map((k, i) =>
            k === '' ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => press(k)}
                aria-label={k === 'back' ? 'Delete last digit' : k}
                className="h-12 rounded-control border border-stone-300 bg-white text-[17px] font-semibold text-brown-900 hover:bg-stone-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brown-700"
              >
                {k === 'back' ? <Delete className="mx-auto h-5 w-5" /> : k}
              </button>
            ),
          )}
        </div>
      </div>
    </main>
  );
};
