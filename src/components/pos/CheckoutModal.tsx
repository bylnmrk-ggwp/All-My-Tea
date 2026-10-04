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
          <DialogTitle>Take payment</DialogTitle>
          <DialogDescription>
            <span className="capitalize">{orderType.replace('-', ' ')}</span>
            {orderType === 'dine-in' && tableNumber && (
              <>
                <span className="mx-1">,</span>
                <span>{tableNumber}</span>
              </>
            )}
            {customerName && (
              <>
                <span className="mx-1">,</span>
                <span>{customerName}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCompleteOrder} className="space-y-4">
          {/* Order Summary Box */}
          <div className="p-3 bg-stone-100 rounded-control border border-stone-300 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-700">
              <span>Items ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              <span className=" font-medium">₱{rawSubtotal.toLocaleString()}</span>
            </div>

            {/* Senior / PWD Discount */}
            <div className="pt-1 flex items-center justify-between border-t border-stone-300">
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={hasSeniorPwdDiscount}
                  onChange={(e) => {
                    setHasSeniorPwdDiscount(e.target.checked);
                    if (cashTendered === rawSubtotal) {
                      setCashTendered(e.target.checked ? Math.round(rawSubtotal * 0.8) : rawSubtotal);
                    }
                  }}
                  className="rounded-control border-stone-300 accent-brown-700"
                />
                <span>Senior / PWD 20% discount</span>
              </label>
              {hasSeniorPwdDiscount && (
                <span className="font-mono text-status-ready font-semibold">
                  -₱{discountAmount.toLocaleString()}
                </span>
              )}
            </div>

            <div className="pt-2 flex justify-between text-sm font-bold text-brown-900 border-t border-stone-300">
              <span>Total</span>
              <span className=" text-base text-brown-700">
                ₱{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <Label className="block mb-1.5">Payment method</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2 px-3 rounded-control border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'Cash'
                    ? 'border-brown-700 bg-brown-700 text-white'
                    : 'border-stone-300 bg-white hover:bg-stone-100 text-brown-900'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('GCash')}
                className={`py-2 px-3 rounded-control border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'GCash'
                    ? 'border-brown-700 bg-brown-700 text-white'
                    : 'border-stone-300 bg-white hover:bg-stone-100 text-brown-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>GCash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Maya')}
                className={`py-2 px-3 rounded-control border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'Maya'
                    ? 'border-brown-700 bg-brown-700 text-white'
                    : 'border-stone-300 bg-white hover:bg-stone-100 text-brown-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Maya</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'Cash' && (
            <div className="space-y-3 p-3 bg-stone-100 rounded-control border border-stone-300">
              <div>
                <Label htmlFor="cash-tender" className="block mb-1">Cash received (₱)</Label>
                <Input
                  id="cash-tender"
                  type="number"
                  min={grandTotal}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                  className="text-base font-bold"
                  required
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-stone-500 mr-1">Quick amounts</span>
                {[grandTotal, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickCash(amt)}
                    className="px-2 py-1 text-xs bg-white border border-stone-300 rounded-control hover:border-brown-700 transition-colors"
                  >
                    ₱{amt}
                  </button>
                ))}
              </div>

              {/* Change Output */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-stone-300">
                <span className="text-stone-700 font-medium">Change</span>
                <span className="text-base font-bold font-mono text-status-ready">
                  ₱{changeAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Digital E-Wallet (GCash / Maya) Simulation */}
          {(paymentMethod === 'GCash' || paymentMethod === 'Maya') && (
            <div className="p-4 bg-stone-100 border border-stone-300 rounded-control flex items-center gap-4 text-xs">
              <div className="w-20 h-20 bg-white rounded-control border border-stone-300 p-1.5 flex flex-col items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-brown-700" />
                <span className="text-[10px] text-brown-700 mt-0.5">Scan to pay</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="font-semibold text-brown-900 block">
                  AllmyTea {paymentMethod}
                </span>
                <span className="font-mono text-stone-700 block">Account: 0917-123-4567</span>
                <Input
                  type="text"
                  placeholder="Reference number"
                  value={gcashRef}
                  onChange={(e) => setGcashRef(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Back
            </Button>
            <Button
              type="submit"
              size="sm"
            >
              Complete order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
