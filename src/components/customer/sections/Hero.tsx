import React from 'react';
import { Phone } from 'lucide-react';
import { logo } from '@/src/assets/images';
import { Button } from '../../ui/button';
import { StoreStatusChip } from './StoreStatusChip';
import { PHONE_HREF } from './FindUs';
import { STORE_INFO } from '../../../data/allMyTeaData';

export const Hero: React.FC<{ onOrder: () => void }> = ({ onOrder }) => (
  <section className="bg-brand-500 text-brown-900">
    <div className="mx-auto grid max-w-[1120px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-8 lg:py-20">
      <img
        src={logo}
        alt="AllmyTea Burger & Milktea House logo"
        className="hero-enter h-36 w-36 rounded-full shadow-[0_12px_40px_rgba(43,27,16,0.18)] lg:order-2 lg:h-64 lg:w-64"
      />
      <div className="max-w-[34rem] lg:order-1">
        <StoreStatusChip />
        <h1 className="font-display mt-5 text-[44px] font-semibold leading-[1.02] lg:text-[64px]">
          Burger &amp; Milktea House in Malabon.
        </h1>
        <p className="mt-5 max-w-[30rem] text-[17px] leading-relaxed">
          Grilled burgers, boba milk tea, ramen overload, sushi and sizzling plates at {STORE_INFO.address}. Open till 1 AM every night.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={onOrder}>Order on Messenger</Button>
          <Button size="lg" variant="outline" asChild className="border-brown-700/40 bg-transparent hover:bg-brown-700/10">
            <a href={PHONE_HREF}><Phone className="h-4 w-4" />Call {STORE_INFO.contact}</a>
          </Button>
        </div>
      </div>
    </div>
  </section>
);
