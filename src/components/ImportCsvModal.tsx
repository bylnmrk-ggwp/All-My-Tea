import React, { useState } from 'react';
import { InventoryItem } from '../types/inventory';
import { parseCSVToItems } from '../utils/csv';
import { Upload, AlertCircle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: InventoryItem[]) => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Partial<InventoryItem>[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      validateAndParse(content);
    };
    reader.readAsText(file);
  };

  const validateAndParse = (text: string) => {
    setErrorMsg('');
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }
    const result = parseCSVToItems(text);
    if (!result.success || !result.items) {
      setErrorMsg(result.error || 'Failed to parse CSV format.');
      setParsedPreview(null);
    } else {
      setParsedPreview(result.items);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;

    setIsProcessing(true);
    const completeItems: InventoryItem[] = parsedPreview.map((p, idx) => ({
      id: `item-import-${Date.now()}-${idx}`,
      sku: p.sku || `SKU-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: p.name || `Imported Item ${idx + 1}`,
      category: p.category || 'General',
      stock: p.stock !== undefined ? p.stock : 0,
      minThreshold: p.minThreshold !== undefined ? p.minThreshold : 5,
      unitCost: p.unitCost !== undefined ? p.unitCost : 0,
      unitPrice: p.unitPrice !== undefined ? p.unitPrice : 0,
      unit: p.unit || 'pcs',
      location: p.location || 'Unassigned',
      supplier: p.supplier || 'Imported Vendor',
      description: p.description || '',
      lastUpdated: new Date().toISOString(),
    }));

    onImport(completeItems);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Inventory CSV</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet export or paste raw comma-separated inventory values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input box */}
          <div className="border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-md p-6 text-center cursor-pointer relative bg-neutral-50/50 transition-colors">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-neutral-800">
              Click to upload a CSV file or drag and drop
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Accepted headers: SKU, Name, Category, Stock, MinThreshold, UnitCost, UnitPrice, Location
            </p>
          </div>

          {/* Or Paste Raw Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-700">Or Paste CSV Text</label>
              {rawText && (
                <button
                  type="button"
                  onClick={() => {
                    setRawText('');
                    setParsedPreview(null);
                    setErrorMsg('');
                  }}
                  className="text-[11px] text-neutral-500 hover:text-neutral-800"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                validateAndParse(e.target.value);
              }}
              placeholder={`SKU,Name,Category,Stock,MinThreshold,UnitCost,UnitPrice,Location\nELC-9011,Lithium Battery 3.7V,Electronics,120,30,4.20,9.50,Bay C-01`}
              className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedPreview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Ready to import {parsedPreview.length} items
                </span>
                <span className="text-neutral-500">Previewing first 3 rows</span>
              </div>
              <div className="border border-neutral-200 rounded-md overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px]">
                    <tr>
                      <th className="py-1.5 px-3">SKU</th>
                      <th className="py-1.5 px-3">Name</th>
                      <th className="py-1.5 px-3">Category</th>
                      <th className="py-1.5 px-3 text-right">Stock</th>
                      <th className="py-1.5 px-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {parsedPreview.slice(0, 3).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-3 font-mono text-neutral-700">{item.sku}</td>
                        <td className="py-1.5 px-3 font-medium text-neutral-900">{item.name}</td>
                        <td className="py-1.5 px-3 text-neutral-600">{item.category}</td>
                        <td className="py-1.5 px-3 text-right font-mono tabular-nums">{item.stock}</td>
                        <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                          ${(item.unitCost || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!parsedPreview || parsedPreview.length === 0 || isProcessing}
              onClick={handleConfirmImport}
            >
              {isProcessing ? 'Importing...' : `Import ${parsedPreview?.length || 0} Items`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
