import React, { useState } from 'react';
import { logo } from '@/src/assets/images';
import { MenuItem, MenuCategory, CartItem, Order, OrderType } from '../../types/allmytea';
import { STORE_INFO } from '../../data/allMyTeaData';
import { ItemCustomizerModal } from '../pos/ItemCustomizerModal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  ShoppingBag,
  MapPin,
  Clock,
  Phone,
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ExternalLink,
  UtensilsCrossed,
  ShieldCheck,
  CheckCircle,
  Truck,
  Coffee,
  Check,
} from 'lucide-react';

interface CustomerLandingPageProps {
  menuItems: MenuItem[];
  onOpenStaff: () => void;
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

export const CustomerLandingPage: React.FC<CustomerLandingPageProps> = ({
  menuItems,
  onOpenStaff,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForCustom, setSelectedItemForCustom] = useState<MenuItem | null>(null);

  // Customer Cart & Checkout
  const [customerCart, setCustomerCart] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);

  // Checkout Form Details
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentOption, setPaymentOption] = useState<'Cash on Delivery / Pick-up' | 'GCash'>('Cash on Delivery / Pick-up');

  // Filtered menu
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const cartTotal = customerCart.reduce((acc, item) => acc + item.subtotal, 0);
  const cartItemCount = customerCart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (newItem: CartItem) => {
    setCustomerCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.menuItemId === newItem.menuItemId &&
          JSON.stringify(i.customization) === JSON.stringify(newItem.customization)
      );
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += newItem.quantity;
        copy[existingIdx].subtotal = copy[existingIdx].quantity * copy[existingIdx].unitPrice;
        return copy;
      }
      return [...prev, newItem];
    });
    setIsCartDrawerOpen(true);
  };

  const handleUpdateQty = (cartItemId: string, delta: number) => {
    setCustomerCart((prev) =>
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

  const handleRemoveItem = (cartItemId: string) => {
    setCustomerCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleCustomerSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please provide your name and phone number for order updates.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      alert('Please specify your delivery address in Diffun.');
      return;
    }

    const orderNumber = `#AMT-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: Order = {
      id: `ord-cust-${Date.now()}`,
      orderNumber,
      type: orderType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      items: customerCart,
      subtotal: cartTotal,
      discount: 0,
      total: cartTotal,
      status: 'pending',
      paymentMethod: paymentOption === 'GCash' ? 'GCash' : 'Cash',
      paymentStatus: 'paid',
      timestamp: new Date().toISOString(),
      cashier: 'Online Customer Order',
    };
    setOrderConfirmed(newOrder);
    setCustomerCart([]);
    setIsCheckoutModalOpen(false);
    setIsCartDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* 1. Customer Top Announcement & Navigation */}
      <div className="bg-amber-900 text-amber-100 text-xs py-2 px-4 text-center border-b border-amber-950/20 flex items-center justify-center gap-4">
        <span>📍 105 Yanga St., Maysilo, Malabon City · Open Daily 4:00 PM – 1:00 AM</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline font-mono">Call / Text 0920 293 9976</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="AllmyTea Logo"
              className="w-10 h-10 rounded-full object-cover border border-amber-300 shadow-2xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-neutral-900 leading-none">
                  AllmyTea
                </span>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 leading-none">
                  Maysilo, Malabon
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Burger · Milktea · Ramen · Sushi & Sizzling
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-700">
            <a href="#menu" className="hover:text-amber-800 transition-colors">
              Menu Highlights
            </a>
            <a href="#categories" className="hover:text-amber-800 transition-colors">
              Explore Full Menu
            </a>
            <a href="#about" className="hover:text-amber-800 transition-colors">
              Store Info & Location
            </a>
            <a
              href="https://www.facebook.com/AllMyTeaBurgerMilktea/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-800 transition-colors inline-flex items-center gap-1"
            >
              <span>Facebook Page</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </nav>

          {/* Actions: Cart & Staff POS Portal */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative text-xs font-semibold border-amber-800/30 text-amber-900 hover:bg-amber-50 inline-flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-amber-800" />
              <span>My Order</span>
              {cartItemCount > 0 && (
                <span className="font-mono text-xs bg-amber-800 text-white rounded-full px-1.5 py-0.2 font-bold tabular-nums ml-1">
                  {cartItemCount}
                </span>
              )}
            </Button>

            <Button
              size="sm"
              onClick={onOpenStaff}
              className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold"
            >
              Staff POS
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative bg-neutral-950 text-white overflow-hidden py-16 lg:py-24">
        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>MALABON'S FAVORITE BURGER, RAMEN & MILKTEA HUB</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Craving juicy burgers, iced milk tea & warm ramen overload?
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Welcome to <span className="text-white font-semibold">AllmyTea</span> at 105 Yanga St., Maysilo, Malabon City. We serve freshly grilled beef burgers, boba milk teas, authentic Japanese ramen overload, freshly rolled sushi, and sizzling meals.
            </p>

            {/* Quick Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Dine-In & Takeout Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Local Malabon Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Open 4:00 PM – 1:00 AM</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a
                href="#menu"
                className="px-6 py-3 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-sm rounded-md transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <span>View Full Menu</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <a
                href="tel:09202939976"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-md transition-colors border border-white/20 inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>Call 0920 293 9976</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Signatures */}
      <section id="menu" className="py-12 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Crowd Favorites
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
                What People Love at AllmyTea
              </h2>
            </div>
            <p className="text-xs text-neutral-500 max-w-md">
              Hand-crafted daily with authentic ingredients, rich broths, pure beef patties, and freshly cooked tapioca pearls.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Signature 1: Ramen Overload */}
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:border-amber-700/60 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-800">Ramen Specialty</span>
                <h3 className="font-bold text-sm text-neutral-900 mt-1">
                  Allmytea Special RAMEN Overload
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Rich broth loaded with tender pork slices, soft-boiled egg, fresh cabbage, sweet corn, enoki mushrooms, and nori.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
                <span className="font-mono font-bold text-base text-neutral-900">₱189</span>
                <Button
                  size="sm"
                  onClick={() => {
                    const item = menuItems.find((i) => i.id === 'rmn-1');
                    if (item) setSelectedItemForCustom(item);
                  }}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs h-7"
                >
                  Order
                </Button>
              </div>
            </div>

            {/* Signature 2: Tamago Sushi Roll */}
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:border-amber-700/60 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-800">Fresh Sushi</span>
                <h3 className="font-bold text-sm text-neutral-900 mt-1">
                  Tamago Sushi Roll
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Japanese sweet tamagoyaki egg rolled with toasted nori, sushi rice, toasted white sesame seeds, and Japanese mayo.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
                <span className="font-mono font-bold text-base text-neutral-900">₱130</span>
                <Button
                  size="sm"
                  onClick={() => {
                    const item = menuItems.find((i) => i.id === 'sushi-1');
                    if (item) setSelectedItemForCustom(item);
                  }}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs h-7"
                >
                  Order
                </Button>
              </div>
            </div>

            {/* Signature 3: Double Patty Cheesy Overload */}
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:border-amber-700/60 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-800">Gourmet Burger</span>
                <h3 className="font-bold text-sm text-neutral-900 mt-1">
                  Double Patty Cheesy Overload
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Two grilled 100% beef patties layered with double American cheddar and caramelized onions on toasted brioche.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
                <span className="font-mono font-bold text-base text-neutral-900">₱115</span>
                <Button
                  size="sm"
                  onClick={() => {
                    const item = menuItems.find((i) => i.id === 'bgr-2');
                    if (item) setSelectedItemForCustom(item);
                  }}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs h-7"
                >
                  Order
                </Button>
              </div>
            </div>

            {/* Signature 4: Brown Sugar Boba */}
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:border-amber-700/60 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-800">Signature Milk Tea</span>
                <h3 className="font-bold text-sm text-neutral-900 mt-1">
                  Brown Sugar Boba Cream Cheese
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Tiger brown sugar pearls topped with thick savory-sweet cream cheese froth and fresh black tea.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
                <span className="font-mono font-bold text-base text-neutral-900">₱95</span>
                <Button
                  size="sm"
                  onClick={() => {
                    const item = menuItems.find((i) => i.id === 'mt-3');
                    if (item) setSelectedItemForCustom(item);
                  }}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs h-7"
                >
                  Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complete Digital Menu Section */}
      <section id="categories" className="py-12 bg-neutral-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Browse AllmyTea Menu
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Select any item to customize sugar levels, ice preferences, toppings, or add to your order.
            </p>
          </div>

          {/* Search & Category Filter Navigation */}
          <div className="bg-white p-3.5 rounded-lg border border-neutral-200 shadow-xs space-y-3 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ramen, tamago roll, cheeseburger, sisig, milk tea..."
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

            {/* Filter buttons */}
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

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemForCustom(item)}
                className="p-4 bg-white border border-neutral-200 rounded-lg hover:border-amber-700/60 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="font-mono text-amber-800 font-semibold">{item.code}</span>
                    <span>{item.category}</span>
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900 mt-1 leading-snug group-hover:text-amber-900 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
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
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-neutral-500 bg-white border border-neutral-200 rounded-lg">
              <p className="text-sm font-semibold text-neutral-800">No items match your search</p>
              <p className="text-xs text-neutral-500 mt-1">Try another category or clear the search query.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Cozy Atmosphere & About Section */}
      <section id="about" className="py-12 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Visit AllmyTea in Malabon
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                Your late-night comfort food haven in Maysilo, Malabon City.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Whether you're stopping by for a late-night milk tea fix, meeting friends for hot ramen overload, or ordering takeout burgers and sizzling meals for the family, AllmyTea is open late from afternoon to past midnight to serve you.
              </p>

              {/* Location Highlights Card */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3 text-xs text-neutral-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Store Address:</span>
                    <span className="text-neutral-800 font-medium">105 Yanga St., Maysilo, Malabon City</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1 border-t border-neutral-200/80">
                  <Phone className="w-4 h-4 text-amber-800 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-900">Contact / Delivery Hotline: </span>
                    <a href="tel:09202939976" className="font-mono font-bold text-amber-900 hover:underline">
                      0920 293 9976
                    </a>
                  </div>
                </div>

                {/* Opening Hours Schedule */}
                <div className="pt-2 border-t border-neutral-200/80">
                  <div className="flex items-center gap-2 mb-2 font-bold text-neutral-900">
                    <Clock className="w-4 h-4 text-amber-800 shrink-0" />
                    <span>Weekly Operating Hours</span>
                    <span className="text-[11px] font-normal text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded font-mono ml-auto">
                      Daily: 4:00 PM – 1:00 AM
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px] bg-white p-2.5 rounded border border-neutral-200">
                    {[
                      { day: 'Monday', time: '4:00 PM - 1:00 AM' },
                      { day: 'Tuesday', time: '4:00 PM - 1:00 AM' },
                      { day: 'Wednesday', time: '4:00 PM - 1:00 AM' },
                      { day: 'Thursday', time: '4:00 PM - 1:00 AM' },
                      { day: 'Friday', time: '4:00 PM - 1:00 AM' },
                      { day: 'Saturday', time: '4:00 PM - 1:00 AM' },
                      { day: 'Sunday', time: '4:00 PM - 1:00 AM' },
                    ].map((sched) => (
                      <div key={sched.day} className="flex justify-between py-0.5 border-b border-neutral-100 last:border-b-0 sm:last:border-b">
                        <span className="font-semibold text-neutral-700">{sched.day}</span>
                        <span className="text-neutral-900 font-bold">{sched.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-neutral-900 text-neutral-400 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="AllmyTea Logo"
              className="w-8 h-8 rounded-full object-cover border border-amber-400/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-bold text-white block">AllmyTea | Malabon</span>
              <span className="text-[11px] text-neutral-400">105 Yanga St., Maysilo, Malabon City</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-neutral-400">Tel: 0920 293 9976</span>
            <a
              href="https://www.facebook.com/AllMyTeaBurgerMilktea/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Facebook: @AllMyTeaBurgerMilktea
            </a>
            <button
              onClick={onOpenStaff}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-neutral-700 text-[11px]"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Item Customizer Modal */}
      <ItemCustomizerModal
        item={selectedItemForCustom}
        onClose={() => setSelectedItemForCustom(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Customer Cart Drawer / Modal */}
      <Dialog open={isCartDrawerOpen} onOpenChange={setIsCartDrawerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-800" />
              <span>Your AllmyTea Order</span>
            </DialogTitle>
            <DialogDescription>Review your items before checkout.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {customerCart.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                Your cart is empty. Pick items from the menu to get started!
              </div>
            ) : (
              customerCart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3 bg-neutral-50 rounded-md border border-neutral-200 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-neutral-900">{item.name}</h4>
                      <div className="text-[11px] text-neutral-500 mt-0.5 space-y-0.5">
                        {item.customization.size && <span>Size: {item.customization.size} · </span>}
                        {item.customization.sugarLevel && (
                          <span>{item.customization.sugarLevel} sugar · {item.customization.iceLevel}</span>
                        )}
                        {item.customization.spiciness && (
                          <span className="text-rose-700 font-semibold block">
                            Spice: {item.customization.spiciness}
                          </span>
                        )}
                        {item.customization.addons && item.customization.addons.length > 0 && (
                          <span className="text-amber-800 font-semibold block">
                            + {item.customization.addons.map((a) => a.name).join(', ')}
                          </span>
                        )}
                        {item.customization.specialInstructions && (
                          <span className="italic text-neutral-500 block">
                            "{item.customization.specialInstructions}"
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 tabular-nums">
                      ₱{item.subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60">
                    <div className="flex items-center gap-1.5">
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
                      onClick={() => handleRemoveItem(item.cartItemId)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full border-t border-neutral-200">
            <div>
              <span className="text-[11px] text-neutral-500 block">Order Total</span>
              <span className="text-lg font-bold font-mono text-neutral-900 tabular-nums">
                ₱{cartTotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCartDrawerOpen(false)}>
                Add More Items
              </Button>
              <Button
                size="sm"
                disabled={customerCart.length === 0}
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
                className="bg-amber-800 hover:bg-amber-900 text-white font-semibold"
              >
                Checkout (₱{cartTotal.toLocaleString()})
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Checkout Modal */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Your AllmyTea Order</DialogTitle>
            <DialogDescription>
              Provide your details for pick-up or fast delivery in Diffun, Quirino.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCustomerSubmitOrder} className="space-y-4 text-xs">
            {/* Delivery vs Pick-up */}
            <div>
              <Label className="block mb-1.5 font-semibold text-neutral-800">Order Method</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`p-2 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    orderType === 'delivery'
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Diffun Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pick-up')}
                  className={`p-2 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    orderType === 'pick-up'
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Store Pick-Up</span>
                </button>
              </div>
            </div>

            {/* Customer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cust-name" className="block mb-1">Your Full Name</Label>
                <Input
                  id="cust-name"
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cust-phone" className="block mb-1">Mobile Phone (for SMS/Call)</Label>
                <Input
                  id="cust-phone"
                  type="text"
                  placeholder="0917-xxx-xxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Delivery Address */}
            {orderType === 'delivery' && (
              <div>
                <Label htmlFor="cust-address" className="block mb-1">
                  Complete Malabon Address (Street, Barangay, Landmark)
                </Label>
                <Input
                  id="cust-address"
                  type="text"
                  placeholder="e.g. 105 Yanga St., or Near Maysilo Brgy Hall, Malabon"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Payment Method */}
            <div>
              <Label className="block mb-1.5 font-semibold text-neutral-800">Payment Option</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentOption('Cash on Delivery / Pick-up')}
                  className={`p-2 rounded-md border text-xs font-medium transition-colors ${
                    paymentOption === 'Cash on Delivery / Pick-up'
                      ? 'border-amber-800 bg-amber-50 text-amber-950 font-bold'
                      : 'border-neutral-200 bg-white text-neutral-700'
                  }`}
                >
                  Cash on Delivery / Pick-up
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption('GCash')}
                  className={`p-2 rounded-md border text-xs font-medium transition-colors ${
                    paymentOption === 'GCash'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-neutral-200 bg-white text-neutral-700'
                  }`}
                >
                  GCash (Pay upon delivery/pickup)
                </button>
              </div>
            </div>

            {/* Total calculation */}
            <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-neutral-500 block">Total Amount to Pay</span>
                <span className="text-xs text-neutral-400">
                  {orderType === 'delivery' ? 'Local Diffun Delivery' : 'Pick-up at Store'}
                </span>
              </div>
              <span className="font-mono text-lg font-bold text-amber-900 tabular-nums">
                ₱{cartTotal.toLocaleString()}
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCheckoutModalOpen(false)}>
                Back
              </Button>
              <Button type="submit" size="sm" className="bg-amber-800 hover:bg-amber-900 text-white font-semibold">
                Confirm & Place Order (₱{cartTotal})
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Confirmed Success Modal */}
      {orderConfirmed && (
        <Dialog open={!!orderConfirmed} onOpenChange={() => setOrderConfirmed(null)}>
          <DialogContent className="max-w-md text-center py-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl">Order Received!</DialogTitle>
            <DialogDescription className="text-xs mt-1">
              Your order <span className="font-mono font-bold text-neutral-900">{orderConfirmed.orderNumber}</span> has been transmitted directly to the AllmyTea kitchen team.
            </DialogDescription>

            <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Type:</span>
                <span className="font-bold uppercase text-neutral-900">{orderConfirmed.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Customer:</span>
                <span className="text-neutral-900">{orderConfirmed.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Phone:</span>
                <span className="text-neutral-900">{orderConfirmed.customerPhone}</span>
              </div>
              {orderConfirmed.deliveryAddress && (
                <div className="text-[11px] text-neutral-600 font-sans pt-1 border-t border-neutral-200">
                  <span>Deliver to: {orderConfirmed.deliveryAddress}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-amber-900 pt-1 border-t border-neutral-200">
                <span className="font-sans">Total Due:</span>
                <span>₱{orderConfirmed.total.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-500 mt-4">
              Estimated preparation time: 15–25 minutes. For inquiries, you may call our store at <span className="font-mono font-semibold">0920 293 9976</span>.
            </p>

            <DialogFooter className="mt-4 sm:justify-center">
              <Button size="sm" onClick={() => setOrderConfirmed(null)} className="w-full bg-amber-800 hover:bg-amber-900 text-white">
                Awesome, Got It!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
