import React from 'react';
import { Search, Plus } from 'lucide-react';
import type { MenuCategory, MenuItem } from '../../../types/allmytea';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

export const MENU_CATEGORIES: MenuCategory[] = [
  'All', 'Ramen Overload', 'Sushi & Rolls', 'Burgers', 'Sizzling & Chao Fan', 'Wings & Snacks', 'Milk Tea & Coffee',
];

const OPTION_CATEGORIES: MenuCategory[] = ['Milk Tea & Coffee', 'Burgers', 'Ramen Overload', 'Sushi & Rolls'];

/** True when ItemCustomizerModal has something to ask for this item. */
export function hasOptions(item: MenuItem): boolean {
  return OPTION_CATEGORIES.includes(item.category) || Boolean(item.sizes?.length);
}

interface MenuBrowserProps {
  items: MenuItem[];
  category: MenuCategory;
  onCategory: (c: MenuCategory) => void;
  query: string;
  onQuery: (q: string) => void;
  onAdd: (item: MenuItem) => void;
}

export const MenuBrowser: React.FC<MenuBrowserProps> = ({ items, category, onCategory, query, onQuery, onAdd }) => {
  const q = query.trim().toLowerCase();
  const visible = items.filter((item) =>
    (category === 'All' || item.category === category) &&
    (!q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)),
  );
  const groups = MENU_CATEGORIES.filter((c) => c !== 'All' && visible.some((i) => i.category === c));

  const chip = (c: MenuCategory) => (
    <button
      key={c}
      type="button"
      onClick={() => onCategory(c)}
      aria-pressed={category === c}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
        category === c ? 'bg-brown-700 text-white' : 'bg-stone-100 text-brown-900 hover:bg-stone-200'
      }`}
    >
      {c}
    </button>
  );

  return (
    <section id="menu" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-[30px] font-semibold text-brown-900">Menu</h2>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search the menu" className="pl-9" aria-label="Search the menu" />
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[200px_1fr] lg:gap-10">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:sticky lg:top-20 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0">
          {MENU_CATEGORIES.map(chip)}
        </div>

        <div className="mt-4 lg:mt-0">
          {groups.length === 0 && (
            <p className="py-10 text-center text-[15px] text-stone-700">Nothing matches "{query}". Try another word.</p>
          )}
          {groups.map((group) => (
            <div key={group} className="mb-10">
              <h3 className="font-display text-[22px] font-semibold text-brown-900">{group}</h3>
              <ul className="mt-3 divide-y divide-stone-300 border-y border-stone-300">
                {visible.filter((i) => i.category === group).map((item) => (
                  <li key={item.id} className="flex items-start gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[17px] font-semibold text-brown-900">{item.name}</div>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-stone-700">{item.description}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-[17px] font-semibold text-brown-900">
                        ₱{item.basePrice}{item.sizes && <span className="text-[13px] font-normal text-stone-500"> 16oz</span>}
                      </span>
                      {item.available ? (
                        <Button size="sm" variant="outline" onClick={() => onAdd(item)} aria-label={`Add ${item.name}`}>
                          <Plus className="h-3.5 w-3.5" />Add
                        </Button>
                      ) : (
                        <span className="text-[13px] font-semibold text-stone-500">Sold out</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
