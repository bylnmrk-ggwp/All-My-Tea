import React from 'react';
import { Order } from '../../types/allmytea';
import { STORE_INFO } from '../../data/allMyTeaData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Printer, CheckCircle } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Order Placed & Sent to Kitchen</span>
          </div>
          <DialogTitle className="text-base">Store Sales Receipt</DialogTitle>
        </DialogHeader>

        {/* Thermal Receipt Visual Simulation */}
        <div className="bg-white p-5 border border-dashed border-neutral-300 rounded font-mono text-xs text-neutral-800 space-y-3 shadow-inner">
          {/* Header */}
          <div className="text-center space-y-0.5 border-b border-neutral-300 pb-3">
            <h3 className="font-bold text-sm text-neutral-900 tracking-wider">
              {STORE_INFO.name.toUpperCase()}
            </h3>
            <p className="text-[10px] text-neutral-600">{STORE_INFO.address}</p>
            <p className="text-[10px] text-neutral-500">Tel: {STORE_INFO.contact}</p>
            <p className="text-[10px] text-neutral-500">{STORE_INFO.facebook}</p>
          </div>

          {/* Ticket Metadata */}
          <div className="space-y-1 text-[11px] border-b border-neutral-300 pb-2">
            <div className="flex justify-between">
              <span className="font-bold text-neutral-900">ORDER {order.orderNumber}</span>
              <span className="uppercase font-semibold text-amber-800">{order.type}</span>
            </div>
            {order.tableNumber && (
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-semibold">{order.tableNumber}</span>
              </div>
            )}
            {order.customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}</span>
              </div>
            )}
            {order.deliveryAddress && (
              <div className="text-[10px] text-neutral-600">
                <span>Deliver to: {order.deliveryAddress}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500">
              <span>Date:</span>
              <span>
                {new Date(order.timestamp).toLocaleString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Cashier:</span>
              <span>{order.cashier}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 border-b border-neutral-300 pb-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="text-[11px]">
                <div className="flex justify-between font-semibold">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="tabular-nums">₱{item.subtotal.toLocaleString()}</span>
                </div>
                {/* Customizations */}
                <div className="pl-3 text-[10px] text-neutral-500 space-y-0.5">
                  {item.customization.size && <div>Size: {item.customization.size}</div>}
                  {item.customization.sugarLevel && (
                    <div>Sugar: {item.customization.sugarLevel} · Ice: {item.customization.iceLevel}</div>
                  )}
                  {item.customization.spiciness && <div>Spice: {item.customization.spiciness}</div>}
                  {item.customization.addons && item.customization.addons.length > 0 && (
                    <div>+ {item.customization.addons.map((a) => `${a.name} (₱${a.price})`).join(', ')}</div>
                  )}
                  {item.customization.specialInstructions && (
                    <div className="italic">Note: "{item.customization.specialInstructions}"</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums">₱{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Senior/PWD Discount (20%):</span>
                <span className="tabular-nums">-₱{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-neutral-900 pt-1 border-t border-neutral-200">
              <span>TOTAL DUE:</span>
              <span className="tabular-nums">₱{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-600 pt-1">
              <span>Payment ({order.paymentMethod}):</span>
              <span className="tabular-nums">
                {order.cashTendered ? `₱${order.cashTendered.toLocaleString()}` : 'PAID'}
              </span>
            </div>
            {order.change !== undefined && order.change > 0 && (
              <div className="flex justify-between text-[11px] font-semibold text-neutral-800">
                <span>Change:</span>
                <span className="tabular-nums">₱{order.change.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Footer Thank You */}
          <div className="text-center pt-3 text-[10px] text-neutral-500 border-t border-neutral-300 space-y-0.5">
            <p className="font-semibold text-neutral-700">Thank you for ordering at All My Tea!</p>
            <p>Please present this receipt when claiming your order.</p>
            <p className="tracking-widest font-mono text-[9px] text-neutral-400 mt-1">*** OFFICIAL STORE COPY ***</p>
          </div>
        </div>

        <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </Button>
          <Button type="button" size="sm" onClick={onClose}>
            Done & New Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
