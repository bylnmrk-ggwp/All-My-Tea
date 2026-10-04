import { MenuItem, StoreIngredient, Order, StockMovement } from '../types/allmytea';
import { MENU_ITEMS, INITIAL_INGREDIENTS, INITIAL_ORDERS } from '../data/allMyTeaData';

const MENU_KEY = 'allmytea_menu_v2';
const INGREDIENTS_KEY = 'allmytea_ingredients_v2';
const ORDERS_KEY = 'allmytea_orders_v2';
const MOVEMENTS_KEY = 'allmytea_movements_v2';

export function loadMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (!raw) {
      saveMenuItems(MENU_ITEMS);
      return MENU_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MENU_ITEMS;
  } catch (err) {
    console.error('Error loading menu:', err);
    return MENU_ITEMS;
  }
}

export function saveMenuItems(items: MenuItem[]): void {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving menu:', err);
  }
}

export function loadIngredients(): StoreIngredient[] {
  try {
    const raw = localStorage.getItem(INGREDIENTS_KEY);
    if (!raw) {
      saveIngredients(INITIAL_INGREDIENTS);
      return INITIAL_INGREDIENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INGREDIENTS;
  } catch (err) {
    console.error('Error loading ingredients:', err);
    return INITIAL_INGREDIENTS;
  }
}

export function saveIngredients(ingredients: StoreIngredient[]): void {
  try {
    localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(ingredients));
  } catch (err) {
    console.error('Error saving ingredients:', err);
  }
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      saveOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ORDERS;
  } catch (err) {
    console.error('Error loading orders:', err);
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders:', err);
  }
}

export function loadMovements(): StockMovement[] {
  try {
    const raw = localStorage.getItem(MOVEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

export function saveMovements(movements: StockMovement[]): void {
  try {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  } catch (err) {
    console.error('Error saving movements:', err);
  }
}

export function resetStoreData() {
  saveMenuItems(MENU_ITEMS);
  saveIngredients(INITIAL_INGREDIENTS);
  saveOrders(INITIAL_ORDERS);
  saveMovements([]);
  return {
    menu: MENU_ITEMS,
    ingredients: INITIAL_INGREDIENTS,
    orders: INITIAL_ORDERS,
    movements: [],
  };
}
