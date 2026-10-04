import React, { useState } from 'react';
import { CartItem, OrderType, PaymentMethod, Order } from '../../types/allmytea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { QrCode, Banknote, Smartphone, Check } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  orderType: OrderType;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  cashierName: string;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  orderType,
  tableNumber,
  customerName,
  customerPhone,
  deliveryAddress,
  cashierName,
  onOrderSuccess,
}) => {
  const rawSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const [hasSeniorPwdDiscount, setHasSeniorPwdDiscount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [cashTendered, setCashTendered] = useState<number>(rawSubtotal);
  const [gcashRef, setGcashRef] = useState('');

  // Discount: 20% if Senior/PWD
  const discountAmount = hasSeniorPwdDiscount ? Math.round(rawSubtotal * 0.2) : 0;
  const grandTotal = Math.max(0, rawSubtotal - discountAmount);
  const changeAmount = paymentMethod === 'Cash' ? Math.max(0, (cashTendered || 0) - grandTotal) : 0;

  const handleQuickCash = (amt: number) => {
    setCashTendered(amt);
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'Cash' && cashTendered < grandTotal) {
      alert(`Cash tendered (₱${cashTendered}) is less than total amount (₱${grandTotal}).`);
      return;
    }

    const orderNumber = `#AMT-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      type: orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      items: cart,
      subtotal: rawSubtotal,
      discount: discountAmount,
      total: grandTotal,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'paid',
      cashTendered: paymentMethod === 'Cash' ? cashTendered : undefined,
      change: paymentMethod === 'Cash' ? changeAmount : undefined,
      timestamp: new Date().toISOString(),
      cashier: cashierName,
    };

    onOrderSuccess(newOrder);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order Payment & Checkout</DialogTitle>
          <DialogDescription>
            <span>{orderType.toUpperCase()}</span>
            {orderType === 'dine-in' && tableNumber && (
              <>
                <span className="mx-1">·</span>
                <span>{tableNumber}</span>
              </>
            )}
            {customerName && (
              <>
                <span className="mx-1">·</span>
                <span>{customerName}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCompleteOrder} className="space-y-4">
          {/* Order Summary Box */}
          <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 text-xs space-y-1.5">
            <div className="flex justify-between text-neutral-600">
              <span>Items Total ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span className="font-mono tabular-nums font-medium">₱{rawSubtotal.toLocaleString()}</span>
            </div>

            {/* Senior / PWD Discount */}
            <div className="pt-1 flex items-center justify-between border-t border-neutral-200/80">
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700">
                <input
                  type="checkbox"
                  checked={hasSeniorPwdDiscount}
                  onChange={(e) => {
                    setHasSeniorPwdDiscount(e.target.checked);
                    if (cashTendered === rawSubtotal) {
                      setCashTendered(e.target.checked ? Math.round(rawSubtotal * 0.8) : rawSubtotal);
                    }
                  }}
                  className="rounded border-neutral-300 text-amber-800 focus:ring-amber-800"
                />
                <span>Apply Senior / PWD 20% Discount</span>
              </label>
              {hasSeniorPwdDiscount && (
                <span className="font-mono text-emerald-700 font-semibold tabular-nums">
                  -₱{discountAmount.toLocaleString()}
                </span>
              )}
            </div>

            <div className="pt-2 flex justify-between text-sm font-bold text-neutral-900 border-t border-neutral-200">
              <span>Grand Total</span>
              <span className="font-mono tabular-nums text-base text-amber-900">
                ₱{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <Label className="block mb-1.5 font-semibold text-neutral-800">Payment Option</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2 px-3 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'Cash'
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('GCash')}
                className={`py-2 px-3 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'GCash'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>GCash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Maya')}
                className={`py-2 px-3 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'Maya'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Maya</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'Cash' && (
            <div className="space-y-3 p-3 bg-neutral-50 rounded-md border border-neutral-200">
              <div>
                <Label htmlFor="cash-tender" className="block mb-1">Cash Tendered (₱)</Label>
                <Input
                  id="cash-tender"
                  type="number"
                  min={grandTotal}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                  className="font-mono text-base font-bold tabular-nums"
                  required
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-neutral-500 mr-1">Presets:</span>
                {[grandTotal, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickCash(amt)}
                    className="px-2 py-1 text-xs bg-white border border-neutral-200 rounded hover:border-neutral-400 font-mono tabular-nums transition-colors"
                  >
                    ₱{amt}
                  </button>
                ))}
              </div>

              {/* Change Output */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-neutral-200">
                <span className="text-neutral-600 font-medium">Customer Change</span>
                <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                  ₱{changeAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Digital E-Wallet (GCash / Maya) Simulation */}
          {(paymentMethod === 'GCash' || paymentMethod === 'Maya') && (
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-md flex items-center gap-4 text-xs">
              <div className="w-20 h-20 bg-white rounded border border-blue-200 p-1.5 flex flex-col items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-blue-600" />
                <span className="text-[9px] font-mono text-blue-800 mt-0.5">SCAN TO PAY</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="font-semibold text-blue-900 block">
                  All My Tea {paymentMethod} Merchant
                </span>
                <span className="font-mono text-neutral-600 block">Account: 0917-123-4567</span>
                <Input
                  type="text"
                  placeholder="Enter 6-digit Reference / Ref No."
                  value={gcashRef}
                  onChange={(e) => setGcashRef(e.target.value)}
                  className="h-8 text-xs bg-white font-mono"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Back to Order
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-amber-800 hover:bg-amber-900 text-white"
            >
              Complete Order & Send to Kitchen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
