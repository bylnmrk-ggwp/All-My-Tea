import React, { useState } from 'react';
import { MenuItem, MenuCategory, CartItem, OrderType, Order } from '../../types/allmytea';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Panel } from '../staff/Panel';
import { Search, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

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
        {/* Filter Controls Bar */}
        <Panel padded className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the menu"
              className="pl-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-stone-500 hover:text-brown-900"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brown-700 text-white'
                    : 'bg-stone-100 text-brown-900 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Panel>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setSelectedItemForCustom(item)}
              disabled={!item.available}
              className="flex flex-col justify-between rounded-panel border border-stone-300 bg-white p-3.5 text-left transition-colors hover:border-brown-700 disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brown-700"
            >
              <div>
                <div className="flex items-start justify-between gap-2 text-[12px] text-stone-500">
                  <span className="font-mono">{item.code}</span>
                  <span>{item.category}</span>
                </div>
                <h3 className="mt-1 text-[15px] font-semibold leading-snug text-brown-900">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-stone-700">{item.description}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-stone-300 pt-2.5">
                <span className="text-[15px] font-semibold text-brown-900">
                  ₱{item.basePrice}{item.sizes && <span className="text-[12px] font-normal text-stone-500"> 16oz</span>}
                </span>
                <span className="inline-flex items-center gap-1 rounded-control bg-brown-700 px-2.5 py-1 text-[12px] font-semibold text-white"><Plus className="h-3.5 w-3.5" />Add</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right 4 Cols: Order Ticket */}
      <Panel className="lg:col-span-4 lg:sticky lg:top-[72px] flex flex-col">
        {/* Ticket Header */}
        <div className="border-b border-stone-300 bg-stone-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brown-700" />
              <h2 className="text-[15px] font-semibold text-brown-900">Current ticket</h2>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-[12px] text-stone-500 hover:text-status-danger transition-colors"
              >
                Clear ticket
              </button>
            )}
          </div>

          {/* Order Type */}
          <div className="mt-3 grid grid-cols-4 gap-1 rounded-control bg-stone-200 p-1 text-[12px]">
            {(['dine-in', 'take-out', 'pick-up', 'delivery'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                aria-pressed={orderType === type}
                className={`rounded-control py-1 font-semibold capitalize ${
                  orderType === type ? 'bg-white text-brown-900' : 'text-stone-700 hover:text-brown-900'
                }`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Table / Customer Details based on Order Type */}
          <div className="mt-3 space-y-2 text-[13px]">
            {orderType === 'dine-in' && (
              <div className="flex items-center gap-2">
                <span className="text-stone-700 font-medium shrink-0">Table</span>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="h-9 w-full rounded-control border border-stone-300 bg-white px-2 text-[13px]"
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
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Mobile number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            )}

            {orderType === 'delivery' && (
              <div>
                <Input
                  type="text"
                  placeholder="Delivery address in Malabon (street, barangay, landmark)"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Ticket Items */}
        <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto divide-y divide-stone-300 flex-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-[13px] font-semibold text-brown-900">Ticket is empty</p>
              <p className="text-[12px]">Tap a menu item to add it.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="pt-2.5 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-[13px] font-semibold text-brown-900 leading-tight">{item.name}</h4>
                    {/* Customization Details */}
                    <div className="text-[12px] text-stone-700 mt-0.5 space-y-0.5">
                      {item.customization.size && (
                        <span>{item.customization.size}, </span>
                      )}
                      {item.customization.sugarLevel && (
                        <span>{item.customization.sugarLevel} sugar, {item.customization.iceLevel}</span>
                      )}
                      {item.customization.spiciness && (
                        <span>{item.customization.spiciness}</span>
                      )}
                      {item.customization.addons && item.customization.addons.length > 0 && (
                        <div className="text-brown-700 font-medium">
                          + {item.customization.addons.map((a) => a.name).join(', ')}
                        </div>
                      )}
                      {item.customization.specialInstructions && (
                        <div className="italic text-stone-500">
                          "{item.customization.specialInstructions}"
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[13px] font-semibold text-brown-900 shrink-0">
                    ₱{item.subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Qty controls */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.cartItemId, -1)}
                      aria-label="Remove one"
                      className="w-7 h-7 rounded-control border border-stone-300 flex items-center justify-center hover:bg-stone-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-[13px] w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.cartItemId, 1)}
                      aria-label="Add one"
                      className="w-7 h-7 rounded-control border border-stone-300 flex items-center justify-center hover:bg-stone-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCartItem(item.cartItemId)}
                    className="text-stone-500 hover:text-status-danger transition-colors p-1"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Footer */}
        <div className="p-4 border-t border-stone-300 bg-stone-100 space-y-3">
          <div className="flex justify-between items-center text-[13px] text-stone-700">
            <span>Items</span>
            <span className="font-medium">{totalCartCount}</span>
          </div>
          <div className="flex justify-between items-center border-t border-stone-300 pt-2">
            <span className="text-[15px] font-semibold text-brown-900">Total</span>
            <span className="text-[22px] font-bold text-brown-900">
              ₱{cartSubtotal.toLocaleString()}
            </span>
          </div>

          <Button
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full justify-between"
          >
            <span>Take payment</span>
            <span>₱{cartSubtotal.toLocaleString()}</span>
          </Button>
        </div>
      </Panel>

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
