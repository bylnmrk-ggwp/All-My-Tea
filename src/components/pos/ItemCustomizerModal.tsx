import React, { useState, useEffect } from 'react';
import { MenuItem, OrderCustomization, CartItem } from '../../types/allmytea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Plus, Minus, Check } from 'lucide-react';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

const DRINK_ADDONS = [
  { name: 'Black Pearl (Boba)', price: 15 },
  { name: 'Cream Cheese Froth', price: 20 },
  { name: 'Egg Pudding', price: 15 },
  { name: 'Nata de Coco Jelly', price: 15 },
  { name: 'Crushed Oreo', price: 15 },
];

const BURGER_ADDONS = [
  { name: 'Extra Beef Patty', price: 45 },
  { name: 'Smoked Bacon Strips', price: 25 },
  { name: 'Cheddar Cheese Slice', price: 15 },
  { name: 'Fried Sunny Egg', price: 15 },
];

const RAMEN_ADDONS = [
  { name: 'Extra Chashu Pork', price: 35 },
  { name: 'Marinated Ramen Egg', price: 25 },
  { name: 'Extra Ramen Noodles', price: 30 },
  { name: 'Nori Seaweed Sheet', price: 15 },
];

const SUSHI_ADDONS = [
  { name: 'Extra Japanese Mayo', price: 15 },
  { name: 'Extra Wasabi & Ginger', price: 15 },
  { name: 'Spicy Tempura Crunch', price: 20 },
  { name: 'Sweet Unagi Glaze', price: 15 },
];

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  const [size, setSize] = useState<'16oz' | '22oz'>('16oz');
  const [sugarLevel, setSugarLevel] = useState<'0%' | '25%' | '50%' | '75%' | '100%'>('100%');
  const [iceLevel, setIceLevel] = useState<'No Ice' | 'Less Ice' | 'Regular Ice'>('Regular Ice');
  const [selectedAddons, setSelectedAddons] = useState<{ name: string; price: number }[]>([]);
  const [spiciness, setSpiciness] = useState<'Mild' | 'Medium' | 'Extra Spicy'>('Medium');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) {
      setSize('16oz');
      setSugarLevel('100%');
      setIceLevel('Regular Ice');
      setSelectedAddons([]);
      setSpiciness('Medium');
      setSpecialInstructions('');
      setQuantity(1);
    }
  }, [item]);

  if (!item) return null;

  // Calculate pricing
  const isDrink = item.category === 'Milk Tea & Coffee';
  const isBurger = item.category === 'Burgers';
  const isRamen = item.category === 'Ramen Overload';
  const isSushi = item.category === 'Sushi & Rolls';

  const sizeDelta = isDrink && size === '22oz' ? 20 : 0;
  const addonsTotal = selectedAddons.reduce((acc, addon) => acc + addon.price, 0);
  const unitPrice = item.basePrice + sizeDelta + addonsTotal;
  const subtotal = unitPrice * quantity;

  const toggleAddon = (addon: { name: string; price: number }) => {
    if (selectedAddons.some((a) => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleConfirm = () => {
    const customization: OrderCustomization = {
      ...(isDrink && { size, sugarLevel, iceLevel }),
      ...(isRamen && { spiciness }),
      ...(selectedAddons.length > 0 && { addons: selectedAddons }),
      ...(specialInstructions.trim() && { specialInstructions: specialInstructions.trim() }),
    };

    onAddToCart({
      cartItemId: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      unitPrice,
      quantity,
      subtotal,
      customization,
    });
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Drink Size Selector */}
          {isDrink && (
            <div>
              <Label className="block mb-1.5">Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSize('16oz')}
                  className={`p-2.5 rounded-control border text-xs font-medium flex items-center justify-between transition-colors ${
                    size === '16oz'
                      ? 'border-brown-700 bg-brown-700 text-white'
                      : 'border-stone-300 bg-white hover:bg-stone-100 text-brown-900'
                  }`}
                >
                  <span>Medium (16oz)</span>
                  <span className="">₱{item.basePrice}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSize('22oz')}
                  className={`p-2.5 rounded-control border text-xs font-medium flex items-center justify-between transition-colors ${
                    size === '22oz'
                      ? 'border-brown-700 bg-brown-700 text-white'
                      : 'border-stone-300 bg-white hover:bg-stone-100 text-brown-900'
                  }`}
                >
                  <span>Large (22oz)</span>
                  <span className="">₱{item.basePrice + 20}</span>
                </button>
              </div>
            </div>
          )}

          {/* Sugar */}
          {isDrink && item.allowSugarIce && (
            <div>
              <Label className="block mb-1.5">Sugar Level</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['0%', '25%', '50%', '75%', '100%'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSugarLevel(lvl)}
                    className={`py-1.5 text-xs rounded-control border transition-colors ${
                      sugarLevel === lvl
                        ? 'bg-brown-700 border-brown-700 text-white font-semibold'
                        : 'border-stone-300 bg-white text-brown-900 hover:bg-stone-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ice Level */}
          {isDrink && item.allowSugarIce && (
            <div>
              <Label className="block mb-1.5">Ice</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['No Ice', 'Less Ice', 'Regular Ice'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIceLevel(lvl)}
                    className={`py-1.5 text-xs rounded-control border transition-colors ${
                      iceLevel === lvl
                        ? 'bg-brown-700 border-brown-700 text-white font-semibold'
                        : 'border-stone-300 bg-white text-brown-900 hover:bg-stone-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ramen Spiciness */}
          {isRamen && (
            <div>
              <Label className="block mb-1.5">Spice</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['Mild', 'Medium', 'Extra Spicy'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSpiciness(lvl)}
                    className={`py-2 text-xs rounded-control border transition-colors ${
                      spiciness === lvl
                        ? 'bg-brown-700 border-brown-700 text-white font-semibold'
                        : 'border-stone-300 bg-white text-brown-900 hover:bg-stone-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {(isDrink || isBurger || isRamen || isSushi) && (
            <div>
              <Label className="block mb-1.5">
                {isDrink
                  ? 'Toppings and add-ons'
                  : isBurger
                  ? 'Add-ons'
                  : isRamen
                  ? 'Toppings'
                  : 'Extras'}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(isDrink
                  ? DRINK_ADDONS
                  : isBurger
                  ? BURGER_ADDONS
                  : isRamen
                  ? RAMEN_ADDONS
                  : SUSHI_ADDONS
                ).map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <button
                      key={addon.name}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`p-2 rounded-control border text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'border-brown-700 bg-brand-500/20 text-brown-900 font-medium'
                          : 'border-stone-300 bg-white hover:bg-stone-100 text-brown-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-3.5 h-3.5 rounded-control border flex items-center justify-center text-[10px] ${
                            isSelected
                              ? 'bg-brown-700 border-brown-700 text-white'
                              : 'border-stone-300'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span>{addon.name}</span>
                      </div>
                      <span className=" text-stone-500">
                        +₱{addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <Label htmlFor="special-inst" className="block mb-1">Special instructions</Label>
            <input
              id="special-inst"
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Separate chili oil, extra napkins, cut in half"
              className="w-full h-9 px-3 text-[13px] border border-stone-300 rounded-control bg-white focus:outline-hidden focus:ring-2 focus:ring-brown-700"
            />
          </div>

          {/* Quantity Row */}
          <div className="flex items-center justify-between p-3 bg-stone-100 rounded-control border border-stone-300">
            <span className="text-xs font-semibold text-brown-900">Quantity</span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-7 w-7"
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
              <span className="font-mono font-bold text-sm w-6 text-center">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-7 w-7"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full border-t border-stone-300">
          <div>
            <span className="text-[11px] text-stone-500 block">Subtotal</span>
            <span className="text-lg font-bold font-mono text-brown-900">
              ₱{subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
            >
              Add to order, ₱{subtotal.toLocaleString()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
