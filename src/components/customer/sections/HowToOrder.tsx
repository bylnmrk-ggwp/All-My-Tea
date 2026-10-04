import React from 'react';

const STEPS = [
  { title: 'Pick your items', body: 'Browse the menu below and add what you want. Choose size, sugar, ice, and add-ons.' },
  { title: 'Send the order on Messenger', body: 'Tap "Send order on Messenger". Your order text is ready to send; we confirm the total and timing in chat.' },
  { title: 'Pick up or get it delivered', body: 'Pick up at 105 Yanga St., or ask for delivery within Malabon City. Pay cash, GCash, or Maya.' },
];

export const HowToOrder: React.FC = () => (
  <section className="bg-cream-50 py-14">
    <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
      <h2 className="font-display text-[30px] font-semibold text-brown-900">How ordering works</h2>
      <ol className="mt-8 grid gap-8 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[22px] font-semibold text-brown-900">{i + 1}</span>
            <div>
              <h3 className="text-[17px] font-semibold text-brown-900">{step.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-stone-700">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
