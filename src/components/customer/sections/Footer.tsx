import React from 'react';
import { logo } from '@/src/assets/images';
import { STORE_INFO } from '../../../data/allMyTeaData';
import { FACEBOOK_URL } from './FindUs';

export const Footer: React.FC<{ onOpenStaff: () => void }> = ({ onOpenStaff }) => (
  <footer className="bg-brown-900 py-10 text-[13px] text-stone-300">
    <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <img src={logo} alt="" className="h-8 w-8 rounded-full" />
        <div>
          <div className="font-semibold text-white">{STORE_INFO.name} Burger &amp; Milktea House</div>
          <div>{STORE_INFO.address}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="hover:text-white">Facebook</a>
        <a href="/staff/pos" onClick={(e) => { e.preventDefault(); onOpenStaff(); }} className="hover:text-white">Staff sign in</a>
      </div>
    </div>
  </footer>
);
