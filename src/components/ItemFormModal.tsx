import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types/inventory';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ItemFormModalProps {
  isOpen: boolean;
  itemToEdit: InventoryItem | null;
  onClose: () => void;
  onSave: (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>, editId?: string) => void;
  existingCategories: string[];
}

const COMMON_CATEGORIES = [
  'Electronics',
  'Raw Materials',
  'Packaging',
  'Tools & Hardware',
  'Office & Warehouse Supplies',
  'Apparel & Safety Gear',
  'Chemicals & Lubricants',
];

const UNITS = ['pcs', 'box', 'kg', 'pack', 'meter', 'roll', 'bag', 'set', 'kit'];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
  existingCategories,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [stock, setStock] = useState<number>(10);
  const [minThreshold, setMinThreshold] = useState<number>(5);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [unit, setUnit] = useState('pcs');
  const [location, setLocation] = useState('');
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const allCategories = Array.from(new Set([...COMMON_CATEGORIES, ...existingCategories]));

  useEffect(() => {
    if (itemToEdit) {
      setSku(itemToEdit.sku);
      setName(itemToEdit.name);
      if (allCategories.includes(itemToEdit.category)) {
        setCategory(itemToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('__custom__');
        setCustomCategory(itemToEdit.category);
      }
      setStock(itemToEdit.stock);
      setMinThreshold(itemToEdit.minThreshold);
      setUnitCost(itemToEdit.unitCost);
      setUnitPrice(itemToEdit.unitPrice);
      setUnit(itemToEdit.unit || 'pcs');
      setLocation(itemToEdit.location);
      setSupplier(itemToEdit.supplier);
      setDescription(itemToEdit.description || '');
    } else {
      generateSku('Electronics');
      setName('');
      setCategory('Electronics');
      setCustomCategory('');
      setStock(25);
      setMinThreshold(10);
      setUnitCost(5.0);
      setUnitPrice(12.5);
      setUnit('pcs');
      setLocation('Bay A-01 · Shelf 1');
      setSupplier('');
      setDescription('');
    }
    setErrorMessage('');
  }, [itemToEdit, isOpen]);

  const generateSku = (cat: string) => {
    const prefix = cat.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ITM');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${randomNum}`);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (!itemToEdit && val !== '__custom__') {
      generateSku(val);
    }
  };

  const marginPercent =
    unitPrice > 0 ? (((unitPrice - unitCost) / unitPrice) * 100).toFixed(1) : '0.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Item name is required.');
      return;
    }
    if (!sku.trim()) {
      setErrorMessage('SKU is required.');
      return;
    }

    const finalCategory = category === '__custom__' ? customCategory.trim() || 'General' : category;

    onSave(
      {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category: finalCategory,
        stock: Math.max(0, stock || 0),
        minThreshold: Math.max(0, minThreshold || 0),
        unitCost: Math.max(0, unitCost || 0),
        unitPrice: Math.max(0, unitPrice || 0),
        unit: unit || 'pcs',
        location: location.trim() || 'Unassigned',
        supplier: supplier.trim() || 'General Vendor',
        description: description.trim(),
      },
      itemToEdit?.id
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {itemToEdit ? 'Edit Inventory Item' : 'Create New Inventory Item'}
          </DialogTitle>
          <DialogDescription>
            Enter SKU, stock counts, warehouse coordinates, and valuation parameters.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs font-medium text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: SKU & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="item-sku">SKU / Code</Label>
                {!itemToEdit && (
                  <button
                    type="button"
                    onClick={() => generateSku(category === '__custom__' ? 'ITM' : category)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto
                  </button>
                )}
              </div>
              <Input
                id="item-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. ELC-1001"
                className="font-mono uppercase"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="item-name" className="block mb-1">Item Title / Name</Label>
              <Input
                id="item-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. High-Torque NEMA 17 Stepper Motor"
                required
              />
            </div>
          </div>

          {/* Row 2: Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={category === '__custom__' ? 'sm:col-span-1' : 'sm:col-span-2'}>
              <Label htmlFor="item-cat" className="block mb-1">Category</Label>
              <select
                id="item-cat"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full h-9 px-3 py-1 text-xs border border-neutral-300 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              >
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">+ Custom Category...</option>
              </select>
            </div>

            {category === '__custom__' && (
              <div>
                <Label htmlFor="item-custom-cat" className="block mb-1">Custom Category</Label>
                <Input
                  id="item-custom-cat"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Hydraulics"
                />
              </div>
            )}

            <div>
              <Label htmlFor="item-unit" className="block mb-1">Stock Unit</Label>
              <select
                id="item-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-9 px-3 py-1 text-xs border border-neutral-300 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Stock on Hand & Min Reorder Threshold */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50/80 border border-neutral-200 rounded-md">
            <div>
              <Label htmlFor="item-stock" className="block mb-1">
                Stock On Hand ({unit})
              </Label>
              <Input
                id="item-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                className="font-mono tabular-nums bg-white"
                required
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">Current physical quantity</span>
            </div>
            <div>
              <Label htmlFor="item-threshold" className="block mb-1">
                Reorder Threshold ({unit})
              </Label>
              <Input
                id="item-threshold"
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseInt(e.target.value, 10) || 0)}
                className="font-mono tabular-nums bg-white"
                required
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">Triggers low-stock alert</span>
            </div>
          </div>

          {/* Row 4: Unit Cost & Unit Price with Margin preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="item-cost" className="block mb-1">Unit Cost ($)</Label>
              <Input
                id="item-cost"
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="font-mono tabular-nums"
                required
              />
            </div>
            <div>
              <Label htmlFor="item-price" className="block mb-1">Unit Retail Price ($)</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="font-mono tabular-nums"
                required
              />
            </div>
            <div>
              <Label className="block mb-1">Gross Margin</Label>
              <div className="h-9 flex items-center px-3 text-xs border border-neutral-200 rounded-md bg-neutral-50 font-mono tabular-nums text-neutral-800">
                {marginPercent}%{' '}
                <span className="text-xs text-neutral-500 font-sans ml-1">
                  (+${(unitPrice - unitCost).toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          {/* Row 5: Location & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="item-loc" className="block mb-1">Warehouse Location / Shelf</Label>
              <Input
                id="item-loc"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bay B-02 · Shelf 3"
              />
            </div>
            <div>
              <Label htmlFor="item-sup" className="block mb-1">Primary Supplier / Vendor</Label>
              <Input
                id="item-sup"
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Apex Industrial Supplies"
              />
            </div>
          </div>

          {/* Row 6: Description */}
          <div>
            <Label htmlFor="item-desc" className="block mb-1">Item Specifications / Description</Label>
            <textarea
              id="item-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical specs, compatibility, packaging notes..."
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Footer buttons */}
          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {itemToEdit ? 'Save Changes' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
