import React, { useState, useEffect } from 'react';
import { MenuItem, StoreIngredient, Order, StockMovement, OrderStatus } from './types/allmytea';
import {
  loadMenuItems, saveMenuItems, loadIngredients, saveIngredients,
  loadOrders, saveOrders, loadMovements, saveMovements, resetStoreData,
} from './utils/allMyTeaStorage';
import { STORE_INFO } from './data/allMyTeaData';
import { useRoute } from './hooks/useRoute';
import { StaffHeader } from './components/staff/StaffHeader';
import { PinGate, isStaffUnlocked, lockStaff } from './components/staff/PinGate';
import { CustomerLandingPage } from './components/customer/CustomerLandingPage';
import { PosView } from './components/pos/PosView';
import { KitchenDisplayView } from './components/kds/KitchenDisplayView';
import { StoreInventoryView } from './components/inventory/StoreInventoryView';
import { OrderHistoryView } from './components/orders/OrderHistoryView';
import { SalesAnalyticsView } from './components/analytics/SalesAnalyticsView';
import { Check } from 'lucide-react';

export default function App() {
  const [route, navigate] = useRoute();
  const [unlocked, setUnlocked] = useState(isStaffUnlocked);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<StoreIngredient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [cashierName] = useState('Maria Santos');
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

  const handleResetData = () => {
    const reset = resetStoreData();
    setMenuItems(reset.menu);
    setIngredients(reset.ingredients);
    setOrders(reset.orders);
    setMovements(reset.movements);
    showToast('Demo data reset');
  };

  const handleSignOut = () => {
    lockStaff();
    setUnlocked(false);
    navigate({ kind: 'landing' });
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const lowIngredientsCount = ingredients.filter((i) => i.stock <= i.reorderThreshold).length;

  const toast = toastMessage && (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-control bg-brown-900 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
      <Check className="h-4 w-4 shrink-0 text-green-400" />
      <span>{toastMessage}</span>
    </div>
  );

  if (route.kind === 'landing') {
    return (
      <>
        <CustomerLandingPage menuItems={menuItems} onOpenStaff={() => navigate({ kind: 'staff', tab: 'pos' })} />
        {toast}
      </>
    );
  }

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  const tab = route.tab;

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 text-brown-900">
      <StaffHeader
        tab={tab}
        onNavigate={(next) => navigate({ kind: 'staff', tab: next })}
        onGoHome={() => navigate({ kind: 'landing' })}
        pendingCount={pendingOrdersCount}
        lowStockCount={lowIngredientsCount}
        cashierName={cashierName}
        onReset={handleResetData}
        onSignOut={handleSignOut}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {tab === 'pos' && <PosView menuItems={menuItems} cashierName={cashierName} onOrderCreated={handleOrderCreated} />}
        {tab === 'kds' && <KitchenDisplayView orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} />}
        {tab === 'inventory' && (
          <StoreInventoryView
            ingredients={ingredients}
            movements={movements}
            onUpdateStock={handleUpdateStock}
            onAddIngredient={handleAddIngredient}
          />
        )}
        {tab === 'orders' && <OrderHistoryView orders={orders} />}
        {tab === 'analytics' && <SalesAnalyticsView orders={orders} />}
      </main>

      <footer className="border-t border-stone-300 bg-white py-3">
        <p className="mx-auto max-w-7xl px-4 text-[12px] text-stone-500 sm:px-6 lg:px-8">
          {STORE_INFO.name}, {STORE_INFO.address}. Open {STORE_INFO.operatingHours}.
        </p>
      </footer>

      {toast}
    </div>
  );
}
