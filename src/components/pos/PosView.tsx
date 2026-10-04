import React, { useState } from 'react';
import { MenuItem, MenuCategory, CartItem, OrderType, Order } from '../../types/allmytea';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  Check,
} from 'lucide-react';

interface PosViewProps {
  menuItems: MenuItem[];
  cashierName: string;
  onOrderCreated: (order: Order) => void;
}

const CATEGORIES: MenuCategory[] = [
  'All',
  'Ramen Overload',
  'Sushi & Rolls',
  'Burgers',
  'Sizzling & Chao Fan',
  'Wings & Snacks',
  'Milk Tea & Coffee',
];

export const PosView: React.FC<PosViewProps> = ({
  menuItems,
  cashierName,
  onOrderCreated,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForCustom, setSelectedItemForCustom] = useState<MenuItem | null>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Checkout & Receipt Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Filtered Menu Items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (newCartItem: CartItem) => {
    setCart((prev) => {
      // Check if identical item + customization already exists in cart
      const existingIdx = prev.findIndex(
        (i) =>
          i.menuItemId === newCartItem.menuItemId &&
          JSON.stringify(i.customization) === JSON.stringify(newCartItem.customization)
      );
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += newCartItem.quantity;
        copy[existingIdx].subtotal = copy[existingIdx].quantity * copy[existingIdx].unitPrice;
        return copy;
      }
      return [...prev, newCartItem];
    });
  };

  const handleUpdateQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleOrderSuccess = (order: Order) => {
    onOrderCreated(order);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setCompletedOrder(order);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 8 Cols: Menu Browser */}
      <div className="lg:col-span-8 space-y-4">
        {/* Banner with All My Tea hero photography */}
        <div className="relative rounded-lg overflow-hidden border border-amber-200/80 shadow-xs bg-neutral-900 text-white min-h-[140px] flex items-end">
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="relative p-5 z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-300">Official Store POS</span>
                <span className="text-white/40">·</span>
                <span className="text-xs text-white/80">Maysilo, Malabon City</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                AllmyTea - Burger & Milktea
              </h1>
              <p className="text-xs text-amber-100/90 mt-1 flex items-center gap-2">
                <span>Dine-In</span>
                <span>·</span>
                <span>Take-Out</span>
                <span>·</span>
                <span>Pick-Up</span>
                <span>·</span>
                <span>Local Malabon Delivery</span>
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-[11px] text-amber-200/80 block">Store Location</span>
              <span className="text-xs text-white font-medium">105 Yanga St., Maysilo, Malabon City</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-3 shadow-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, wintermelon milktea, ramen overload, wings..."
              className="pl-9 text-xs h-9 bg-neutral-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white shadow-xs font-semibold'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 hover:text-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemForCustom(item)}
              className="p-3.5 bg-white border border-neutral-200 rounded-lg hover:border-amber-600/70 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <span className="font-mono text-[11px] font-semibold text-amber-800">
                    {item.code}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-medium">{item.category}</span>
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mt-1 leading-snug group-hover:text-amber-900 transition-colors">
                  {item.name}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Price</span>
                  <span className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                    ₱{item.basePrice}
                    {item.sizes && <span className="text-[10px] text-neutral-500 font-normal"> (16oz)</span>}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-amber-800 hover:bg-amber-900 text-white font-medium"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right 4 Cols: Order Cart */}
      <div className="lg:col-span-4 sticky top-20 bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-800" />
              <h2 className="font-bold text-sm text-neutral-900">Current Order Ticket</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[11px] text-neutral-400 hover:text-rose-600 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Order Type Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-200/60 rounded-md mt-3 text-xs">
            {(['dine-in', 'take-out', 'pick-up', 'delivery'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`py-1 rounded text-[11px] font-medium transition-colors uppercase ${
                  orderType === type
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Table / Customer Details based on Order Type */}
          <div className="mt-3 space-y-2 text-xs">
            {orderType === 'dine-in' && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium shrink-0">Table:</span>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="h-8 px-2 text-xs border border-neutral-300 rounded bg-white w-full"
                >
                  <option value="Table 1">Table 1</option>
                  <option value="Table 2">Table 2</option>
                  <option value="Table 3">Table 3</option>
                  <option value="Table 4">Table 4</option>
                  <option value="Table 5">Table 5</option>
                  <option value="Counter Bar">Counter Bar</option>
                </select>
              </div>
            )}

            {(orderType === 'take-out' || orderType === 'pick-up' || orderType === 'delivery') && (
              <div className="space-y-1.5">
                <Input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
                <Input
                  type="text"
                  placeholder="Contact Mobile Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
              </div>
            )}

            {orderType === 'delivery' && (
              <div>
                <Input
                  type="text"
                  placeholder="Malabon Delivery Address (Street / Barangay / Landmark)"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto divide-y divide-neutral-100 flex-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="text-xs">Ticket is empty.</p>
              <p className="text-[11px] text-neutral-400">Click any menu item to configure and add.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="pt-2.5 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 leading-tight">{item.name}</h4>
                    {/* Customization Details */}
                    <div className="text-[10px] text-neutral-500 mt-0.5 space-y-0.5">
                      {item.customization.size && (
                        <span>Size: {item.customization.size} · </span>
                      )}
                      {item.customization.sugarLevel && (
                        <span>{item.customization.sugarLevel} sugar · {item.customization.iceLevel}</span>
                      )}
                      {item.customization.spiciness && (
                        <span>Spiciness: {item.customization.spiciness}</span>
                      )}
                      {item.customization.addons && item.customization.addons.length > 0 && (
                        <div className="text-amber-800 font-medium">
                          +{item.customization.addons.map((a) => a.name).join(', ')}
                        </div>
                      )}
                      {item.customization.specialInstructions && (
                        <div className="italic text-neutral-400">
                          "{item.customization.specialInstructions}"
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-neutral-900 tabular-nums shrink-0">
                    ₱{item.subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Qty controls */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateQty(item.cartItemId, -1)}
                      className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-xs hover:bg-neutral-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-semibold text-xs tabular-nums w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.cartItemId, 1)}
                      className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-xs hover:bg-neutral-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveCartItem(item.cartItemId)}
                    className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/80 space-y-3">
          <div className="flex justify-between items-center text-xs text-neutral-600">
            <span>Items Count:</span>
            <span className="font-mono font-medium tabular-nums">{totalCartCount}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-neutral-900 border-t border-neutral-200 pt-2">
            <span>Total:</span>
            <span className="font-mono text-lg text-amber-900 tabular-nums">
              ₱{cartSubtotal.toLocaleString()}
            </span>
          </div>

          <Button
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-amber-800 hover:bg-amber-900 text-white font-semibold flex items-center justify-center gap-2"
          >
            <span>Proceed to Payment</span>
            <span className="font-mono tabular-nums">₱{cartSubtotal.toLocaleString()}</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ItemCustomizerModal
        item={selectedItemForCustom}
        onClose={() => setSelectedItemForCustom(null)}
        onAddToCart={handleAddToCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        orderType={orderType}
        tableNumber={tableNumber}
        customerName={customerName}
        customerPhone={customerPhone}
        deliveryAddress={deliveryAddress}
        cashierName={cashierName}
        onOrderSuccess={handleOrderSuccess}
      />

      <ReceiptModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
};
