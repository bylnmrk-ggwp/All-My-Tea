import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { STORE_INFO } from '../../../data/allMyTeaData';

export const FACEBOOK_URL = 'https://www.facebook.com/AllMyTeaBurgerMilktea/';
export const PHONE_HREF = 'tel:09202939976';
export const MAPS_URL = 'https://maps.google.com/?q=105+Yanga+St.,+Maysilo,+Malabon+City';

export const FindUs: React.FC = () => (
  <section id="find-us" className="border-t border-stone-300 bg-white py-14">
    <div className="mx-auto grid max-w-[1120px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <h2 className="font-display text-[30px] font-semibold text-brown-900">Find us</h2>
        <ul className="mt-6 space-y-4 text-[15px]">
          <li className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brown-700" />
            <div>
              <div className="font-semibold">{STORE_INFO.address}</div>
              <a href={MAPS_URL} target="_blank" rel="noreferrer" className="text-brown-700 underline underline-offset-4">Open in Google Maps</a>
            </div>
          </li>
          <li className="flex gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brown-700" />
            <a href={PHONE_HREF} className="font-semibold">{STORE_INFO.contact}</a>
          </li>
          <li className="flex gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brown-700" />
            <div>{STORE_INFO.services}</div>
          </li>
        </ul>
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="mt-6 inline-block text-[15px] font-semibold text-brown-700 underline underline-offset-4">
          Message us on Facebook
        </a>
      </div>

      <div className="rounded-panel border border-stone-300 p-5">
        <h3 className="text-[17px] font-semibold text-brown-900">Opening hours</h3>
        <table className="mt-3 w-full text-[15px]">
          <tbody>
            {STORE_INFO.schedule.map((d) => (
              <tr key={d.day} className="border-b border-stone-300/60 last:border-0">
                <td className="py-2 text-stone-700">{d.day}</td>
                <td className="py-2 text-right font-semibold text-brown-900">{d.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
