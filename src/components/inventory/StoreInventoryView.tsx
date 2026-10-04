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
import { Package, Plus, Minus, Download, AlertTriangle, CheckCircle2, History } from 'lucide-react';

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
      supplier: newSupplier.trim() || 'Diffun Local Vendor',
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

  return (
    <div className="space-y-4">
      {/* Low Stock Alert Notice Banner */}
      {lowStockCount > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between gap-3 text-rose-950 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-rose-600 text-white rounded-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-sm block text-rose-900">
                Low Stock Alert: {lowStockCount} {lowStockCount === 1 ? 'item is' : 'items are'} below safety reorder threshold
              </span>
              <span className="text-rose-700 text-[11px]">
                Please review the highlighted items below and receive fresh shipments or adjust stock accordingly.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-xs">
          <span className="text-xs text-neutral-500 block">Total Ingredients Inventory Value</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums block mt-1">
            ₱{totalValuation.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 block">Across {ingredients.length} supply items</span>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-xs">
          <span className="text-xs text-neutral-500 block">Low Stock Warnings</span>
          <span className={`text-2xl font-bold font-mono tabular-nums block mt-1 ${lowStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {lowStockCount} items
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 block">At or below reorder safety buffer</span>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 block">Inventory Controls</span>
            <span className="text-xs font-semibold text-neutral-800 block mt-1">Export or Register</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1" />
              CSV
            </Button>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="bg-amber-800 hover:bg-amber-900 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Item
            </Button>
          </div>
        </div>
      </div>

      {/* Main Ingredients Table */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-neutral-900">Store Ingredients & Packaging Stock</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live levels of beef patties, boba pearls, milk tea creamers, ramen noodles, and cups.
            </p>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-neutral-50/60">
            <TableRow className="border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <TableHead className="py-2.5 px-4">Ingredient / Supply</TableHead>
              <TableHead className="py-2.5 px-3">Category</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Current Stock</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Min Threshold</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Unit Cost</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Holding Value</TableHead>
              <TableHead className="py-2.5 px-3">Supplier</TableHead>
              <TableHead className="py-2.5 pr-4 pl-3 text-right">Quick Stock Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ing) => {
              const isLow = ing.stock <= ing.reorderThreshold;
              const val = ing.stock * ing.costPerUnit;

              return (
                <TableRow key={ing.id} className="hover:bg-neutral-50/80 transition-colors">
                  <TableCell className="py-2.5 px-4">
                    <span className="font-bold text-neutral-900 text-xs block">{ing.name}</span>
                    <span className="text-[10px] text-neutral-400">
                      Restocked: {new Date(ing.lastRestocked).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-neutral-600 text-xs">{ing.category}</TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-xs font-bold">
                    <span className={isLow ? 'text-amber-700' : 'text-neutral-900'}>
                      {ing.stock} {ing.unit}
                    </span>
                    {isLow && (
                      <span className="block text-[10px] text-amber-700 font-normal">Reorder Alert</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-xs text-neutral-600">
                    {ing.reorderThreshold} {ing.unit}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-xs text-neutral-600">
                    ₱{ing.costPerUnit.toFixed(2)}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-xs font-semibold text-neutral-900">
                    ₱{val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-neutral-600">{ing.supplier}</TableCell>
                  <TableCell className="py-2.5 pr-4 pl-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAdjust(ing, 'in')}
                        className="h-7 text-xs px-2 text-emerald-700 hover:text-emerald-800"
                        title="Receive Stock"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Receive
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAdjust(ing, 'waste')}
                        className="h-7 text-xs px-2 text-rose-700 hover:text-rose-800"
                        title="Record Waste"
                      >
                        <Minus className="w-3 h-3 mr-1" />
                        Waste
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Recent Movements Log */}
      {movements.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
            <History className="w-4 h-4 text-neutral-400" />
            <span>Recent Stock Activity Audit</span>
          </div>
          <div className="border border-neutral-200 rounded-md divide-y divide-neutral-100 text-xs">
            {movements.slice(0, 5).map((m) => (
              <div key={m.id} className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-900">{m.ingredientName}</span>
                  <span className="text-neutral-400 mx-1.5">·</span>
                  <span className={m.delta > 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </span>
                  <span className="text-neutral-400 mx-1.5">·</span>
                  <span className="text-neutral-600">{m.reason}</span>
                </div>
                <div className="text-right text-[11px] text-neutral-500 font-mono">
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="ml-2">Bal: {m.resultingStock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {selectedIngredient && (
        <Dialog open={!!selectedIngredient} onOpenChange={(open) => !open && setSelectedIngredient(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {adjustMode === 'in' ? 'Receive Supply Shipment' : 'Record Kitchen Waste / Spoilage'}
              </DialogTitle>
              <DialogDescription>
                {selectedIngredient.name} (Current: {selectedIngredient.stock} {selectedIngredient.unit})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleConfirmAdjust} className="space-y-4">
              <div>
                <Label htmlFor="adj-qty" className="block mb-1">
                  Quantity to {adjustMode === 'in' ? 'Add' : 'Deduct'} ({selectedIngredient.unit})
                </Label>
                <Input
                  id="adj-qty"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                  className="font-mono tabular-nums text-base"
                  required
                />
              </div>

              <div>
                <Label htmlFor="adj-reason" className="block mb-1">Reason / Note</Label>
                <Input
                  id="adj-reason"
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Weekly delivery, spilled milk tea, damaged buns"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedIngredient(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className={adjustMode === 'in' ? 'bg-emerald-700 hover:bg-emerald-800 text-white' : 'bg-rose-700 hover:bg-rose-800 text-white'}
                >
                  Confirm {adjustMode === 'in' ? 'Stock Check-in' : 'Waste Deduction'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Add New Supply Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register New Supply Ingredient</DialogTitle>
            <DialogDescription>Add a new raw material or packaging item to track.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateIngredient} className="space-y-3">
            <div>
              <Label className="block mb-1">Item Name</Label>
              <Input
                type="text"
                placeholder="e.g. Nori Seaweed Sheets (Pack of 50)"
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
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full h-9 px-2 text-xs border border-neutral-300 rounded bg-white"
                >
                  <option value="Tea & Boba">Tea & Boba</option>
                  <option value="Dairy & Syrups">Dairy & Syrups</option>
                  <option value="Burger & Meat">Burger & Meat</option>
                  <option value="Ramen & Noodles">Ramen & Noodles</option>
                  <option value="Packaging & Cups">Packaging & Cups</option>
                </select>
              </div>

              <div>
                <Label className="block mb-1">Unit of Measure</Label>
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
                <Label className="block mb-1">Initial Stock</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newStock}
                  onChange={(e) => setNewStock(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label className="block mb-1">Reorder Point</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label className="block mb-1">Unit Cost (₱)</Label>
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
              <Label className="block mb-1">Supplier / Vendor</Label>
              <Input
                type="text"
                placeholder="e.g. Diffun Market Supplies"
                value={newSupplier}
                onChange={(e) => setNewSupplier(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-800 hover:bg-amber-900 text-white">
                Save Ingredient
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
