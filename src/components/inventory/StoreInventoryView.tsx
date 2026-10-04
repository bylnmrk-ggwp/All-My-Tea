import React, { useState } from 'react';
import { StoreIngredient, StockMovement } from '../../types/allmytea';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Minus, Download } from 'lucide-react';
import { PageHeader } from '../staff/PageHeader';
import { Panel } from '../staff/Panel';
import { KpiCard } from '../staff/KpiCard';
import { StatusBadge } from '../staff/StatusBadge';
import { EmptyState } from '../staff/EmptyState';

interface StoreInventoryViewProps {
  ingredients: StoreIngredient[];
  movements: StockMovement[];
  onUpdateStock: (ingredientId: string, delta: number, reason: string, isWaste: boolean) => void;
  onAddIngredient: (ingredient: Omit<StoreIngredient, 'id' | 'lastRestocked'>) => void;
}

export const StoreInventoryView: React.FC<StoreInventoryViewProps> = ({
  ingredients,
  movements,
  onUpdateStock,
  onAddIngredient,
}) => {
  const [selectedIngredient, setSelectedIngredient] = useState<StoreIngredient | null>(null);
  const [adjustMode, setAdjustMode] = useState<'in' | 'waste'>('in');
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState('PO Delivery Received');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Ingredient form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Tea & Boba' | 'Dairy & Syrups' | 'Burger & Meat' | 'Ramen & Noodles' | 'Packaging & Cups'>('Tea & Boba');
  const [newStock, setNewStock] = useState<number>(10);
  const [newUnit, setNewUnit] = useState('kg');
  const [newThreshold, setNewThreshold] = useState<number>(5);
  const [newCost, setNewCost] = useState<number>(100);
  const [newSupplier, setNewSupplier] = useState('');

  const lowStockCount = ingredients.filter((i) => i.stock <= i.reorderThreshold).length;
  const totalValuation = ingredients.reduce((acc, i) => acc + i.stock * i.costPerUnit, 0);

  const handleOpenAdjust = (ing: StoreIngredient, mode: 'in' | 'waste') => {
    setSelectedIngredient(ing);
    setAdjustMode(mode);
    setAdjustQty(mode === 'in' ? 10 : 1);
    setAdjustReason(mode === 'in' ? 'Fresh shipment checked in' : 'Expired / Spilled during shift');
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    const delta = adjustMode === 'in' ? Math.max(0.1, adjustQty) : -Math.max(0.1, adjustQty);
    onUpdateStock(selectedIngredient.id, delta, adjustReason, adjustMode === 'waste');
    setSelectedIngredient(null);
  };

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddIngredient({
      name: newName.trim(),
      category: newCategory,
      stock: newStock,
      unit: newUnit,
      reorderThreshold: newThreshold,
      costPerUnit: newCost,
      supplier: newSupplier.trim() || 'Local supplier',
    });

    setIsAddModalOpen(false);
    setNewName('');
  };

  const handleExportCsv = () => {
    const headers = ['Ingredient Name', 'Category', 'Stock On Hand', 'Unit', 'Threshold', 'Unit Cost (PHP)', 'Total Value', 'Supplier'];
    const rows = ingredients.map((i) => [
      `"${i.name}"`,
      `"${i.category}"`,
      i.stock,
      `"${i.unit}"`,
      i.reorderThreshold,
      i.costPerUnit,
      (i.stock * i.costPerUnit).toFixed(2),
      `"${i.supplier}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `allmytea_ingredients_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toISOString().slice(0, 10);
  const movementsToday = movements.filter((m) => m.timestamp.slice(0, 10) === today).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stock"
        description="Ingredients and packaging on hand."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add item
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Stock value"
          value={`₱${totalValuation.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint={`${ingredients.length} items`}
        />
        <KpiCard
          label="Low stock"
          value={lowStockCount}
          hint="At or below the reorder level"
          tone={lowStockCount > 0 ? 'warn' : 'good'}
        />
        <KpiCard label="Movements today" value={movementsToday} hint="Receipts, use, waste, adjustments" />
      </div>

      {/* Ingredients table */}
      <Panel>
        <div className="border-b border-stone-300 px-4 py-3">
          <h2 className="text-[15px] font-semibold text-brown-900">Ingredients and packaging</h2>
        </div>

        <Table>
          <TableHeader className="bg-stone-100">
            <TableRow className="text-[12px] font-semibold text-stone-700">
              <TableHead className="py-2.5 px-4">Item</TableHead>
              <TableHead className="py-2.5 px-3">Category</TableHead>
              <TableHead className="py-2.5 px-3 text-right">On hand</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Reorder at</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Unit cost</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Value</TableHead>
              <TableHead className="py-2.5 px-3">Supplier</TableHead>
              <TableHead className="py-2.5 pr-4 pl-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ing) => {
              const isLow = ing.stock <= ing.reorderThreshold;
              const val = ing.stock * ing.costPerUnit;

              return (
                <TableRow key={ing.id} className={isLow ? 'bg-brand-500/10' : ''}>
                  <TableCell className="py-2.5 px-4">
                    <span className="block text-[13px] font-semibold text-brown-900">{ing.name}</span>
                    <span className="text-[12px] text-stone-500">
                      Restocked {new Date(ing.lastRestocked).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-[13px] text-stone-700">{ing.category}</TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-[13px] font-semibold text-brown-900">
                    <span className="inline-flex items-center gap-2">
                      {isLow && <StatusBadge status="low" />}
                      <span>{ing.stock} {ing.unit}</span>
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-[13px] text-stone-700">
                    {ing.reorderThreshold} {ing.unit}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-[13px] text-stone-700">
                    ₱{ing.costPerUnit.toFixed(2)}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-[13px] font-semibold text-brown-900">
                    ₱{val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-[13px] text-stone-700">{ing.supplier}</TableCell>
                  <TableCell className="py-2.5 pr-4 pl-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => handleOpenAdjust(ing, 'in')}>
                        <Plus className="h-3 w-3" />
                        Receive
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenAdjust(ing, 'waste')}>
                        <Minus className="h-3 w-3" />
                        Waste
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Panel>

      {/* Recent movements */}
      <Panel>
        <div className="border-b border-stone-300 px-4 py-3">
          <h2 className="text-[15px] font-semibold text-brown-900">Recent stock activity</h2>
        </div>
        {movements.length === 0 ? (
          <EmptyState title="No stock activity yet" hint="Receipts and waste you record show up here." />
        ) : (
          <ul className="divide-y divide-stone-300 text-[13px]">
            {movements.slice(0, 8).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <StatusBadge status={m.type} />
                  <span className="truncate font-semibold text-brown-900">{m.ingredientName}</span>
                  <span className={m.delta > 0 ? 'font-semibold text-status-ready' : 'font-semibold text-status-danger'}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </span>
                  <span className="truncate text-stone-700">{m.reason}</span>
                </div>
                <div className="shrink-0 text-right text-[12px] text-stone-500">
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="ml-2">Balance {m.resultingStock}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Adjust modal */}
      {selectedIngredient && (
        <Dialog open={!!selectedIngredient} onOpenChange={(open) => !open && setSelectedIngredient(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{adjustMode === 'in' ? 'Receive stock' : 'Record waste'}</DialogTitle>
              <DialogDescription>
                {selectedIngredient.name}, {selectedIngredient.stock} {selectedIngredient.unit} on hand
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleConfirmAdjust} className="space-y-4">
              <div>
                <Label htmlFor="adj-qty" className="block mb-1">
                  Quantity to {adjustMode === 'in' ? 'add' : 'deduct'} ({selectedIngredient.unit})
                </Label>
                <Input
                  id="adj-qty"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                  className="text-base"
                  required
                />
              </div>

              <div>
                <Label htmlFor="adj-reason" className="block mb-1">Reason</Label>
                <Input
                  id="adj-reason"
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Weekly delivery, spilled milk tea, damaged buns"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedIngredient(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant={adjustMode === 'in' ? 'default' : 'destructive'}>
                  {adjustMode === 'in' ? 'Add stock' : 'Record waste'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Add item modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add stock item</DialogTitle>
            <DialogDescription>Track a new ingredient or packaging item.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateIngredient} className="space-y-3">
            <div>
              <Label className="block mb-1">Item name</Label>
              <Input
                type="text"
                placeholder="Nori seaweed sheets (pack of 50)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block mb-1">Category</Label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                  className="h-9 w-full rounded-control border border-stone-300 bg-white px-2 text-[13px]"
                >
                  <option value="Tea & Boba">Tea & Boba</option>
                  <option value="Dairy & Syrups">Dairy & Syrups</option>
                  <option value="Burger & Meat">Burger & Meat</option>
                  <option value="Ramen & Noodles">Ramen & Noodles</option>
                  <option value="Packaging & Cups">Packaging & Cups</option>
                </select>
              </div>

              <div>
                <Label className="block mb-1">Unit</Label>
                <Input
                  type="text"
                  placeholder="kg, packs, buns, cups"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="block mb-1">Starting stock</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newStock}
                  onChange={(e) => setNewStock(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label className="block mb-1">Reorder at</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label className="block mb-1">Unit cost (₱)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newCost}
                  onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div>
              <Label className="block mb-1">Supplier</Label>
              <Input
                type="text"
                placeholder="e.g. Malabon Market"
                value={newSupplier}
                onChange={(e) => setNewSupplier(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
