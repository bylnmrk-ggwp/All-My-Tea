import { describe, it, expect } from 'vitest';
import type { CartItem } from '../types/allmytea';
import { buildOrderMessage, describeCustomization, messengerUrl, MESSENGER_PAGE } from './messengerOrder';

const burger: CartItem = {
  cartItemId: 'c1', menuItemId: 'bgr-1', name: 'Classic Cheeseburger', category: 'Burgers',
  unitPrice: 89, quantity: 2, subtotal: 178, customization: {},
};
const milkTea: CartItem = {
  cartItemId: 'c2', menuItemId: 'mt-1', name: 'Wintermelon Milk Tea', category: 'Milk Tea & Coffee',
  unitPrice: 95, quantity: 1, subtotal: 95,
  customization: { size: '22oz', sugarLevel: '50%', iceLevel: 'Less Ice', addons: [{ name: 'Black Pearl (Boba)', price: 15 }] },
};

describe('describeCustomization', () => {
  it('lists size, sugar, ice, add-ons, spice, and note in that order', () => {
    expect(describeCustomization({
      size: '16oz', sugarLevel: '25%', iceLevel: 'No Ice',
      addons: [{ name: 'Egg Pudding', price: 15 }, { name: 'Crushed Oreo', price: 15 }],
      spiciness: 'Extra Spicy', specialInstructions: 'no straw',
    })).toBe('16oz, 25% sugar, No Ice, + Egg Pudding, + Crushed Oreo, Extra Spicy, note: no straw');
  });
  it('is empty when nothing is customised', () => {
    expect(describeCustomization({})).toBe('');
  });
});

describe('buildOrderMessage', () => {
  it('formats a pick-up order', () => {
    const msg = buildOrderMessage([burger, milkTea], { orderType: 'pick-up', name: 'Ana', phone: '0917 000 0000' });
    expect(msg).toBe([
      "Hi AllmyTea! I'd like to order:",
      '2x Classic Cheeseburger — ₱178',
      '1x Wintermelon Milk Tea (22oz, 50% sugar, Less Ice, + Black Pearl (Boba)) — ₱95',
      'Total: ₱273',
      'Pick-up',
      'Name: Ana, Phone: 0917 000 0000',
    ].join('\n'));
  });

  it('formats delivery with address and note', () => {
    const msg = buildOrderMessage([burger], {
      orderType: 'delivery', name: 'Ben', phone: '0918 111 2222',
      address: '12 Yanga St., Maysilo', note: 'Gate is blue & has a #3',
    });
    expect(msg).toContain('Delivery to 12 Yanga St., Maysilo');
    expect(msg.endsWith('Note: Gate is blue & has a #3')).toBe(true);
  });

  it('omits the note line when empty or whitespace', () => {
    const msg = buildOrderMessage([burger], { orderType: 'pick-up', name: 'Cy', phone: '0', note: '   ' });
    expect(msg).not.toContain('Note:');
  });

  it('sends a greeting only for an empty cart', () => {
    expect(buildOrderMessage([], { orderType: 'pick-up', name: '', phone: '' })).toBe(
      "Hi AllmyTea! I'd like to place an order.",
    );
  });
});

describe('messengerUrl', () => {
  it('targets the page and encodes the message', () => {
    const url = messengerUrl('Line 1\nTotal: ₱273 & more #tag');
    expect(url.startsWith(`https://m.me/${MESSENGER_PAGE}?text=`)).toBe(true);
    expect(url).toContain('%0A');
    expect(url).toContain('%E2%82%B1');
    expect(url).toContain('%26');
    expect(url).toContain('%23');
    expect(url).not.toContain(' ');
  });
});
