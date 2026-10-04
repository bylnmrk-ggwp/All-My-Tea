import type { CartItem, OrderCustomization } from '../types/allmytea';

export const MESSENGER_PAGE = 'AllMyTeaBurgerMilktea';

export type CustomerOrderType = 'pick-up' | 'delivery';

export interface OrderDetails {
  orderType: CustomerOrderType;
  name: string;
  phone: string;
  address?: string;
  note?: string;
}

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

export function describeCustomization(c: OrderCustomization): string {
  const parts: string[] = [];
  if (c.size) parts.push(c.size);
  if (c.sugarLevel) parts.push(`${c.sugarLevel} sugar`);
  if (c.iceLevel) parts.push(c.iceLevel);
  for (const addon of c.addons ?? []) parts.push(`+ ${addon.name}`);
  if (c.spiciness) parts.push(c.spiciness);
  if (c.specialInstructions?.trim()) parts.push(`note: ${c.specialInstructions.trim()}`);
  return parts.join(', ');
}

export function buildOrderMessage(cart: CartItem[], details: OrderDetails): string {
  if (cart.length === 0) return "Hi AllmyTea! I'd like to place an order.";

  const lines = ["Hi AllmyTea! I'd like to order:"];
  for (const item of cart) {
    const detail = describeCustomization(item.customization);
    lines.push(`${item.quantity}x ${item.name}${detail ? ` (${detail})` : ''} — ${peso(item.subtotal)}`);
  }
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  lines.push(`Total: ${peso(total)}`);
  lines.push(details.orderType === 'delivery' ? `Delivery to ${details.address?.trim() ?? ''}` : 'Pick-up');
  lines.push(`Name: ${details.name.trim()}, Phone: ${details.phone.trim()}`);
  if (details.note?.trim()) lines.push(`Note: ${details.note.trim()}`);
  return lines.join('\n');
}

export function messengerUrl(message: string): string {
  return `https://m.me/${MESSENGER_PAGE}?text=${encodeURIComponent(message)}`;
}
