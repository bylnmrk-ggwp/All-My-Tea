import { InventoryItem } from '../types/inventory';

export function exportItemsToCSV(items: InventoryItem[]): void {
  const headers = [
    'SKU',
    'Name',
    'Category',
    'Stock',
    'MinThreshold',
    'UnitCost',
    'UnitPrice',
    'Unit',
    'Location',
    'Supplier',
    'Description',
    'LastUpdated',
  ];

  const escapeCSV = (value: string | number) => {
    if (value === null || value === undefined) return '""';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const rows = items.map(item => [
    escapeCSV(item.sku),
    escapeCSV(item.name),
    escapeCSV(item.category),
    item.stock,
    item.minThreshold,
    item.unitCost,
    item.unitPrice,
    escapeCSV(item.unit || 'pcs'),
    escapeCSV(item.location),
    escapeCSV(item.supplier),
    escapeCSV(item.description),
    escapeCSV(item.lastUpdated),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `inventrak_inventory_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVToItems(csvText: string): { success: boolean; items?: Partial<InventoryItem>[]; error?: string } {
  try {
    const lines = csvText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length < 2) {
      return { success: false, error: 'CSV file is empty or missing data rows.' };
    }

    // Simple robust CSV line splitter that handles quotes
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const header = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, '').toLowerCase());
    const skuIdx = header.findIndex(h => h.includes('sku'));
    const nameIdx = header.findIndex(h => h.includes('name') || h.includes('title') || h.includes('item'));
    const categoryIdx = header.findIndex(h => h.includes('cat'));
    const stockIdx = header.findIndex(h => h.includes('stock') || h.includes('qty') || h.includes('quantity'));
    const minIdx = header.findIndex(h => h.includes('min') || h.includes('threshold') || h.includes('reorder'));
    const costIdx = header.findIndex(h => h.includes('cost'));
    const priceIdx = header.findIndex(h => h.includes('price'));
    const locIdx = header.findIndex(h => h.includes('location') || h.includes('aisle') || h.includes('bin'));
    const supplierIdx = header.findIndex(h => h.includes('supp') || h.includes('vendor'));
    const unitIdx = header.findIndex(h => h.includes('unit'));
    const descIdx = header.findIndex(h => h.includes('desc'));

    if (nameIdx === -1) {
      return { success: false, error: 'CSV must contain at least a "Name" or "Item" column header.' };
    }

    const items: Partial<InventoryItem>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i]);
      if (row.length < 2) continue;

      const name = nameIdx !== -1 ? row[nameIdx]?.replace(/^"|"$/g, '') : `Item ${i}`;
      if (!name) continue;

      const sku =
        skuIdx !== -1 && row[skuIdx]
          ? row[skuIdx].replace(/^"|"$/g, '').toUpperCase()
          : `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

      const stockVal = stockIdx !== -1 ? parseInt(row[stockIdx]?.replace(/[^0-9.-]/g, ''), 10) : 0;
      const minVal = minIdx !== -1 ? parseInt(row[minIdx]?.replace(/[^0-9.-]/g, ''), 10) : 10;
      const costVal = costIdx !== -1 ? parseFloat(row[costIdx]?.replace(/[^0-9.-]/g, '')) : 0;
      const priceVal = priceIdx !== -1 ? parseFloat(row[priceIdx]?.replace(/[^0-9.-]/g, '')) : costVal * 1.5;

      items.push({
        sku,
        name,
        category: categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx].replace(/^"|"$/g, '') : 'General',
        stock: isNaN(stockVal) ? 0 : Math.max(0, stockVal),
        minThreshold: isNaN(minVal) ? 5 : Math.max(0, minVal),
        unitCost: isNaN(costVal) ? 0 : Math.max(0, costVal),
        unitPrice: isNaN(priceVal) ? 0 : Math.max(0, priceVal),
        unit: unitIdx !== -1 && row[unitIdx] ? row[unitIdx].replace(/^"|"$/g, '') : 'pcs',
        location: locIdx !== -1 && row[locIdx] ? row[locIdx].replace(/^"|"$/g, '') : 'Unassigned',
        supplier: supplierIdx !== -1 && row[supplierIdx] ? row[supplierIdx].replace(/^"|"$/g, '') : 'Standard Supplier',
        description: descIdx !== -1 && row[descIdx] ? row[descIdx].replace(/^"|"$/g, '') : '',
        lastUpdated: new Date().toISOString(),
      });
    }

    return { success: true, items };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown CSV parse error';
    return { success: false, error: message };
  }
}
