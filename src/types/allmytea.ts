export type MenuCategory =
  | 'All'
  | 'Burgers'
  | 'Milk Tea & Coffee'
  | 'Ramen Overload'
  | 'Sushi & Rolls'
  | 'Sizzling & Chao Fan'
  | 'Wings & Snacks';

export interface MenuItem {
  id: string;
  code: string;
  name: string;
  category: MenuCategory;
  basePrice: number;
  description: string;
  available: boolean;
  image?: string;
  sizes?: { label: '16oz' | '22oz'; priceDelta: number }[];
  allowSugarIce?: boolean;
  allowBurgerExtras?: boolean;
  allowSpiceLevel?: boolean;
}

export interface OrderCustomization {
  size?: '16oz' | '22oz';
  sugarLevel?: '0%' | '25%' | '50%' | '75%' | '100%';
  iceLevel?: 'No Ice' | 'Less Ice' | 'Regular Ice';
  addons?: { name: string; price: number }[];
  spiciness?: 'Mild' | 'Medium' | 'Extra Spicy';
  specialInstructions?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  category: MenuCategory;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  customization: OrderCustomization;
}

export type OrderType = 'dine-in' | 'take-out' | 'pick-up' | 'delivery';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'Cash' | 'GCash' | 'Maya';

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  tableNumber?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'unpaid';
  cashTendered?: number;
  change?: number;
  timestamp: string;
  cashier: string;
}

export interface StoreIngredient {
  id: string;
  name: string;
  category: 'Tea & Boba' | 'Dairy & Syrups' | 'Burger & Meat' | 'Ramen & Noodles' | 'Sushi & Rice' | 'Packaging & Cups';
  stock: number;
  unit: string;
  reorderThreshold: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: 'in' | 'out' | 'spoilage' | 'adjustment';
  delta: number;
  resultingStock: number;
  reason: string;
  timestamp: string;
  recordedBy: string;
}

