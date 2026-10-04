import React, { useState, useEffect } from 'react';
import { AppTab, MenuItem, StoreIngredient, Order, StockMovement, OrderStatus } from './types/allmytea';
import {
  loadMenuItems,
  saveMenuItems,
  loadIngredients,
  saveIngredients,
  loadOrders,
  saveOrders,
  loadMovements,
  saveMovements,
  resetStoreData,
} from './utils/allMyTeaStorage';
import { STORE_INFO } from './data/allMyTeaData';
import { AllMyTeaHeader } from './components/AllMyTeaHeader';
import { CustomerLandingPage } from './components/customer/CustomerLandingPage';
import { PosView } from './components/pos/PosView';
import { KitchenDisplayView } from './components/kds/KitchenDisplayView';
import { StoreInventoryView } from './components/inventory/StoreInventoryView';
import { OrderHistoryView } from './components/orders/OrderHistoryView';
import { SalesAnalyticsView } from './components/analytics/SalesAnalyticsView';
import { Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<StoreIngredient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [cashierName, setCashierName] = useState('Maria Santos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Initial data load
  useEffect(() => {
    setMenuItems(loadMenuItems());
    setIngredients(loadIngredients());
    setOrders(loadOrders());
    setMovements(loadMovements());
  }, []);

  // Sync state helpers
  const updateOrdersAndSave = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveOrders(newOrders);
  };

  const updateIngredientsAndSave = (newIngredients: StoreIngredient[]) => {
    setIngredients(newIngredients);
    saveIngredients(newIngredients);
  };

  const updateMovementsAndSave = (newMovements: StockMovement[]) => {
    setMovements(newMovements);
    saveMovements(newMovements);
  };

  // Automatic Inventory Deduction when an Order is placed
  const handleOrderCreated = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    updateOrdersAndSave(updatedOrders);

    // Deduct relevant ingredients
    const newIngredients = [...ingredients];
    const newMovements: StockMovement[] = [...movements];

    newOrder.items.forEach((item) => {
      // 1. Cups deduction
      const cupIng = newIngredients.find((i) =>
        item.customization.size === '22oz' ? i.id === 'ing-11' : i.id === 'ing-10'
      );
      if (cupIng && item.category === 'Milk Tea & Coffee') {
        cupIng.stock = Math.max(0, cupIng.stock - item.quantity);
        newMovements.unshift({
          id: `mov-${Date.now()}-${Math.random()}`,
          ingredientId: cupIng.id,
          ingredientName: cupIng.name,
          type: 'out',
          delta: -item.quantity,
          resultingStock: cupIng.stock,
          reason: `Order ${newOrder.orderNumber}`,
          timestamp: new Date().toISOString(),
          recordedBy: cashierName,
        });
      }

      // 2. Boba tapioca deduction (~0.05kg per cup)
      if (item.category === 'Milk Tea & Coffee' || item.customization.addons?.some((a) => a.name.includes('Pearl'))) {
        const bobaIng = newIngredients.find((i) => i.id === 'ing-1');
        if (bobaIng) {
          const usedBoba = Number((item.quantity * 0.05).toFixed(2));
          bobaIng.stock = Math.max(0, Number((bobaIng.stock - usedBoba).toFixed(2)));
        }
      }

      // 3. Burger patties & buns deduction
      if (item.category === 'Burgers') {
        const pattyIng = newIngredients.find((i) => i.id === 'ing-5');
        const bunIng = newIngredients.find((i) => i.id === 'ing-6');
        const cheeseIng = newIngredients.find((i) => i.id === 'ing-7');

        const pattiesPerBurger = item.name.includes('Double') || item.name.includes('Monster') ? 2 : 1;
        if (pattyIng) {
          pattyIng.stock = Math.max(0, pattyIng.stock - item.quantity * pattiesPerBurger);
        }
        if (bunIng) {
          bunIng.stock = Math.max(0, bunIng.stock - item.quantity);
        }
        if (cheeseIng) {
          cheeseIng.stock = Math.max(0, cheeseIng.stock - item.quantity);
        }
      }

      // 4. Ramen noodles & chashu deduction
      if (item.category === 'Ramen Overload') {
        const noodleIng = newIngredients.find((i) => i.id === 'ing-8');
        const chashuIng = newIngredients.find((i) => i.id === 'ing-9');
        if (noodleIng) {
          noodleIng.stock = Math.max(0, noodleIng.stock - item.quantity);
        }
        if (chashuIng) {
          const slices = item.name.includes('Overload') ? 2 : 1;
          chashuIng.stock = Math.max(0, chashuIng.stock - item.quantity * slices);
        }
      }

      // 5. Sushi nori & tamago deduction
      if (item.category === 'Sushi & Rolls') {
        const sushiIng = newIngredients.find((i) => i.id === 'ing-13');
        if (sushiIng) {
          sushiIng.stock = Math.max(0, sushiIng.stock - item.quantity);
        }
      }
    });

    updateIngredientsAndSave(newIngredients);
    updateMovementsAndSave(newMovements);

    showToast(`Order ${newOrder.orderNumber} received & queued!`);
  };

  // Kitchen Display status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    updateOrdersAndSave(updated);

    const targetOrder = orders.find((o) => o.id === orderId);
    showToast(`Order ${targetOrder?.orderNumber || ''} marked as ${newStatus.toUpperCase()}`);
  };

  // Manual stock adjustments
  const handleUpdateStock = (ingredientId: string, delta: number, reason: string, isWaste: boolean) => {
    const target = ingredients.find((i) => i.id === ingredientId);
    if (!target) return;

    const newStock = Math.max(0, Number((target.stock + delta).toFixed(2)));
    const updatedIngredients = ingredients.map((i) =>
      i.id === ingredientId ? { ...i, stock: newStock, lastRestocked: new Date().toISOString() } : i
    );
    updateIngredientsAndSave(updatedIngredients);

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      ingredientId,
      ingredientName: target.name,
      type: isWaste ? 'spoilage' : delta > 0 ? 'in' : 'adjustment',
      delta,
      resultingStock: newStock,
      reason,
      timestamp: new Date().toISOString(),
      recordedBy: cashierName,
    };
    updateMovementsAndSave([newMovement, ...movements]);

    showToast(`Updated ${target.name}: balance is now ${newStock} ${target.unit}`);
  };

  // Add new ingredient
  const handleAddIngredient = (ingredientData: Omit<StoreIngredient, 'id' | 'lastRestocked'>) => {
    const newId = `ing-${Date.now()}`;
    const newIng: StoreIngredient = {
      ...ingredientData,
      id: newId,
      lastRestocked: new Date().toISOString(),
    };
    updateIngredientsAndSave([newIng, ...ingredients]);
    showToast(`Added "${newIng.name}" to store inventory`);
  };

  // Reset to default demo data
  const handleResetData = () => {
    if (window.confirm('Reset AllmyTea demo data to default sample catalog and tickets?')) {
      const reset = resetStoreData();
      setMenuItems(reset.menu);
      setIngredients(reset.ingredients);
      setOrders(reset.orders);
      setMovements(reset.movements);
      showToast('Store catalog & orders restored to default!');
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const lowIngredientsCount = ingredients.filter((i) => i.stock <= i.reorderThreshold).length;

  // If in customer landing mode
  if (activeTab === 'landing') {
    return (
      <>
        <CustomerLandingPage
          menuItems={menuItems}
          onPlaceCustomerOrder={handleOrderCreated}
          onOpenStaffPortal={() => setActiveTab('pos')}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-md shadow-lg transition-transform animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // Staff Portals (POS, KDS, Inventory, Orders, Analytics)
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col antialiased">
      {/* Brand Header & Tabs */}
      <AllMyTeaHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        lowIngredientsCount={lowIngredientsCount}
        onResetData={handleResetData}
        cashierName={cashierName}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: POS Cashier Register */}
        {activeTab === 'pos' && (
          <PosView
            menuItems={menuItems}
            cashierName={cashierName}
            onOrderCreated={handleOrderCreated}
          />
        )}

        {/* Tab 2: Kitchen Display System (KDS) */}
        {activeTab === 'kds' && (
          <KitchenDisplayView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {/* Tab 3: Store Stocks & Raw Ingredients */}
        {activeTab === 'inventory' && (
          <StoreInventoryView
            ingredients={ingredients}
            movements={movements}
            onUpdateStock={handleUpdateStock}
            onAddIngredient={handleAddIngredient}
          />
        )}

        {/* Tab 4: Past Orders History & Receipts */}
        {activeTab === 'orders' && (
          <OrderHistoryView orders={orders} />
        )}

        {/* Tab 5: Daily Sales & Analytics */}
        {activeTab === 'analytics' && (
          <SalesAnalyticsView orders={orders} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800">{STORE_INFO.name}</span>
            <span>·</span>
            <span>{STORE_INFO.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Hours: {STORE_INFO.operatingHours}</span>
            <span>·</span>
            <span>Contact: {STORE_INFO.contact}</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('landing')}
              className="font-semibold text-amber-800 hover:underline"
            >
              Customer Landing Page →
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-md shadow-lg transition-transform animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
