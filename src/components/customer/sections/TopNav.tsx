import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { logo } from '@/src/assets/images';
import { Button } from '../../ui/button';
import { FACEBOOK_URL } from './FindUs';

interface TopNavProps {
  cartCount: number;
  onOpenCart: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ cartCount, onOpenCart }) => (
  <header className="sticky top-0 z-40 border-b border-stone-300 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <a href="/" className="flex items-center gap-3" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
        <img src={logo} alt="AllmyTea" className="h-9 w-9 rounded-full" />
        <span className="font-display text-[22px] font-semibold text-brown-900">AllmyTea</span>
      </a>

      <nav className="hidden items-center gap-6 text-[15px] font-medium text-brown-900 md:flex" aria-label="Page sections">
        <a href="#menu" className="hover:text-brown-700">Menu</a>
        <a href="#find-us" className="hover:text-brown-700">Find us</a>
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="hover:text-brown-700">Facebook</a>
      </nav>

      <Button onClick={onOpenCart} aria-label={cartCount > 0 ? `Review order, ${cartCount} items` : 'Start an order'}>
        <ShoppingBag className="h-4 w-4" />
        {cartCount > 0 ? `Order (${cartCount})` : 'Order'}
      </Button>
    </div>
  </header>
);
