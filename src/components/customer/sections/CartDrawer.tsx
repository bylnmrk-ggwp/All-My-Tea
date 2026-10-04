import React, { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../../types/allmytea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { buildOrderMessage, describeCustomization, messengerUrl, type CustomerOrderType } from '../../../lib/messengerOrder';
import { PHONE_HREF } from './FindUs';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemove: (cartItemId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onOpenChange, cart, onUpdateQty, onRemove }) => {
  const [orderType, setOrderType] = useState<CustomerOrderType>('pick-up');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  const total = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const missing =
    !name.trim() ? 'Add your name' :
    !phone.trim() ? 'Add your phone number' :
    orderType === 'delivery' && !address.trim() ? 'Add your delivery address' : null;

  const send = async () => {
    const message = buildOrderMessage(cart, { orderType, name, phone, address, note });
    const url = messengerUrl(message);
    // Open before any await so the tap still counts as a user gesture (mobile Safari).
    // No 'noopener' feature flag: with it window.open always returns null, which would
    // make the blocked-popup fallback fire every time.
    const popup = window.open(url, '_blank');
    if (popup) {
      popup.opener = null;
    } else {
      window.location.href = url;
      return;
    }
    let copiedOk = false;
    try {
      await navigator.clipboard.writeText(message);
      copiedOk = true;
    } catch {
      // Clipboard blocked (insecure context or denied permission): the URL still carries the text.
    }
    setCopied(copiedOk);
    if (copiedOk) window.setTimeout(() => setCopied(false), 4000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 flex h-dvh max-h-dvh w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-l border-stone-300 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-stone-300 px-5 py-4 text-left">
          <DialogTitle className="font-display text-[22px] font-semibold">Your order</DialogTitle>
          <DialogDescription>We confirm the total and timing with you on Messenger.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <p className="py-10 text-center text-[15px] text-stone-700">Nothing here yet. Add items from the menu.</p>
          ) : (
            <ul className="divide-y divide-stone-300">
              {cart.map((item) => {
                const detail = describeCustomization(item.customization);
                return (
                  <li key={item.cartItemId} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-brown-900">{item.name}</div>
                      {detail && <div className="text-[13px] text-stone-700">{detail}</div>}
                      <div className="mt-1 text-[13px] text-stone-700">₱{item.unitPrice} each</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Remove one" onClick={() => onUpdateQty(item.cartItemId, -1)}><Minus className="h-3.5 w-3.5" /></Button>
                      <span className="w-6 text-center text-[15px] font-semibold">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Add one" onClick={() => onUpdateQty(item.cartItemId, 1)}><Plus className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item.cartItemId)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Order type">
              {(['pick-up', 'delivery'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={orderType === t}
                  onClick={() => setOrderType(t)}
                  className={`rounded-control border px-3 py-2 text-[13px] font-semibold ${orderType === t ? 'border-brown-700 bg-brown-700 text-white' : 'border-stone-300 bg-white text-brown-900'}`}
                >
                  {t === 'pick-up' ? 'Pick up' : 'Delivery in Malabon'}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="c-name">Name</Label><Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
              <div><Label htmlFor="c-phone">Phone</Label><Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" /></div>
            </div>
            {orderType === 'delivery' && (
              <div><Label htmlFor="c-address">Delivery address</Label><Input id="c-address" value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" /></div>
            )}
            <div><Label htmlFor="c-note">Note (optional)</Label><Input id="c-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Landmark, allergies, less spicy" /></div>
          </div>
        </div>

        <div className="space-y-3 border-t border-stone-300 px-5 py-4">
          <div className="flex items-center justify-between text-[17px] font-semibold text-brown-900">
            <span>Total</span><span>₱{total.toLocaleString('en-PH')}</span>
          </div>
          <Button size="lg" className="w-full" disabled={cart.length === 0 || Boolean(missing)} onClick={send} title={missing ?? undefined}>
            {missing && cart.length > 0 ? missing : 'Send order on Messenger'}
          </Button>
          <Button size="lg" variant="outline" className="w-full" asChild>
            <a href={PHONE_HREF}>Call instead</a>
          </Button>
          <p className={`text-center text-[13px] text-stone-700 ${copied ? '' : 'invisible'}`} aria-live="polite">
            Order copied. Paste it if Messenger opens empty.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
