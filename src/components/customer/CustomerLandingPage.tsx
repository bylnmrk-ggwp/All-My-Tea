import React, { useState } from 'react';
import type { MenuItem, MenuCategory, CartItem } from '../../types/allmytea';
import { ItemCustomizerModal } from '../pos/ItemCustomizerModal';
import { TopNav } from './sections/TopNav';
import { Hero } from './sections/Hero';
import { MenuBrowser, hasOptions } from './sections/MenuBrowser';
import { HowToOrder } from './sections/HowToOrder';
import { FindUs } from './sections/FindUs';
import { Footer } from './sections/Footer';
import { CartDrawer } from './sections/CartDrawer';
import { StickyCartBar } from './sections/StickyCartBar';
import { buildOrderMessage, messengerUrl } from '../../lib/messengerOrder';

interface CustomerLandingPageProps {
  menuItems: MenuItem[];
  onOpenStaff: () => void;
}

export const CustomerLandingPage: React.FC<CustomerLandingPageProps> = ({ menuItems, onOpenStaff }) => {
  const [category, setCategory] = useState<MenuCategory>('All');
  const [query, setQuery] = useState('');
  const [customizing, setCustomizing] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = cart.reduce((n, i) => n + i.subtotal, 0);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.menuItemId === item.menuItemId && JSON.stringify(i.customization) === JSON.stringify(item.customization),
      );
      if (idx === -1) return [...prev, item];
      const next = [...prev];
      const qty = next[idx].quantity + item.quantity;
      next[idx] = { ...next[idx], quantity: qty, subtotal: qty * next[idx].unitPrice };
      return next;
    });
  };

  const handleAdd = (item: MenuItem) => {
    if (hasOptions(item)) {
      setCustomizing(item);
      return;
    }
    addToCart({
      cartItemId: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      unitPrice: item.basePrice,
      quantity: 1,
      subtotal: item.basePrice,
      customization: {},
    });
  };

  const updateQty = (cartItemId: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + delta, subtotal: (i.quantity + delta) * i.unitPrice } : i))
        .filter((i) => i.quantity > 0),
    );

  const remove = (cartItemId: string) => setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));

  // Empty cart: open Messenger with the greeting; otherwise review the order first.
  const handleHeroOrder = () => {
    if (cart.length > 0) {
      setDrawerOpen(true);
      return;
    }
    const url = messengerUrl(buildOrderMessage([], { orderType: 'pick-up', name: '', phone: '' }));
    const popup = window.open(url, '_blank');
    if (popup) popup.opener = null;
    else window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-white pb-20 text-brown-900 md:pb-0">
      <TopNav cartCount={cartCount} onOpenCart={() => setDrawerOpen(true)} />
      <Hero onOrder={handleHeroOrder} />
      <MenuBrowser items={menuItems} category={category} onCategory={setCategory} query={query} onQuery={setQuery} onAdd={handleAdd} />
      <HowToOrder />
      <FindUs />
      <Footer onOpenStaff={onOpenStaff} />

      <StickyCartBar count={cartCount} total={cartTotal} onReview={() => setDrawerOpen(true)} />
      <CartDrawer open={drawerOpen} onOpenChange={setDrawerOpen} cart={cart} onUpdateQty={updateQty} onRemove={remove} />
      <ItemCustomizerModal item={customizing} onClose={() => setCustomizing(null)} onAddToCart={(ci) => { addToCart(ci); setDrawerOpen(true); }} />
    </div>
  );
};
