// ===========================================
// Lista Otpisa (Waste List)
// Evidencija otpisa artikala
// ===========================================

import { useState, useRef, useEffect } from 'react';
import { Printer, Save, RotateCcw, Check, X, Trash2, Scale, AlertCircle } from 'lucide-react';
import { formatDateToId } from '../../utils/date';

interface WasteEntry {
  id: string;
  date: string;
  
  items: {
    id: number;
    itemId: string;
    itemName: string;
    unit: 'kg' | 'l' | 'pcs';
    quantity: number;
    reason: 'ostecen' | 'istekao' | 'kvalitet' | 'ostalo';
    notes: string;
  }[];
  
  totalValue: number;
  notes: string;
  
  kitchenSignature: string;
  managerSignature: string;
  
  createdAt: number;
}

interface WasteListProps {
  onClose?: () => void;
}

const WASTE_REASONS = [
  { value: 'ostecen', label: 'Oštećen' },
  { value: 'istekao', label: 'Istekao rok' },
  { value: 'kvalitet', label: 'Kvalitet' },
  { value: 'ostalo', label: 'Ostalo' },
];

export function WasteList({ onClose }: WasteListProps) {
  const [entries, setEntries] = useState<WasteEntry[]>(() => {
    try {
      const stored = localStorage.getItem('wastelist_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  
  const [currentEntry, setCurrentEntry] = useState<WasteEntry>({
    id: '',
    date: formatDateToId(new Date()),
    items: [
      { id: 1, itemId: '', itemName: '', unit: 'pcs', quantity: 0, reason: 'ostalo', notes: '' },
    ],
    totalValue: 0,
    notes: '',
    kitchenSignature: '',
    managerSignature: '',
    createdAt: Date.now(),
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = formatDateToId(new Date());
    const existing = entries.find(e => e.date === today);
    if (existing) {
      setCurrentEntry(existing);
    }
  }, [entries]);

  useEffect(() => {
    setCurrentEntry(prev => ({
      ...prev,
      totalValue: prev.items.reduce((sum, item) => sum + item.quantity, 0),
    }));
  }, [currentEntry.items]);

  const handleInputChange = (field: keyof WasteEntry, value: any) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const addItem = () => {
    setCurrentEntry(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: Date.now(), 
        itemId: '', 
        itemName: '', 
        unit: 'pcs', 
        quantity: 0, 
        reason: 'ostalo', 
        notes: '' 
      }]
    }));
    setIsSaved(false);
  };

  const updateItem = (id: number, field: string, value: any) => {
    setCurrentEntry(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
    setIsSaved(false);
  };

  const removeItem = (id: number) => {
    if (currentEntry.items.length > 1) {
      setCurrentEntry(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    const entry: WasteEntry = {
      ...currentEntry,
      id: currentEntry.id || `wl-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updated = entries.filter(e => e.date !== entry.date);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('wastelist_entries', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNew = () => {
    setCurrentEntry({
      id: '',
      date: formatDateToId(new Date()),
      items: [
        { id: 1, itemId: '', itemName: '', unit: 'pcs', quantity: 0, reason: 'ostalo', notes: '' },
      ],
      totalValue: 0,
      notes: '',
      kitchenSignature: '',
      managerSignature: '',
      createdAt: Date.now(),
    });
    setIsSaved(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalByReason = WASTE_REASONS.map(reason => ({
    ...reason,
    quantity: currentEntry.items.filter(i => i.reason === reason.value).reduce((sum, i) => sum + i.quantity, 0),
  }));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Lista Otpisa</h1>
            <p className="text-xs text-slate-500">Evidencija odbacenih artikala</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check size={16} /> Sačuvano
            </span>
          )}
          <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
            <Save size={16} /> Sačuvaj
          </button>
          <button onClick={handleNew} className="btn btn-secondary flex items-center gap-2">
            <RotateCcw size={16} /> Nova
          </button>
          <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2">
            <Printer size={16} /> Štampa
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
          
          {/* Print Header */}
          <div className="hidden print:block mb-4 text-center">
            <h1 className="text-2xl font-bold uppercase">Lista Otpisa</h1>
            <p className="text-sm text-slate-500">{currentEntry.date}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Datum</label>
              <input
                type="date"
                value={currentEntry.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-end">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 w-full">
                <div className="text-center">
                  <span className="text-2xl font-bold text-red-600">{currentEntry.items.length}</span>
                  <span className="text-xs text-red-500 block">Stavki</span>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 w-full">
                <div className="text-center">
                  <span className="text-2xl font-bold text-amber-600">{currentEntry.totalValue}</span>
                  <span className="text-xs text-amber-500 block">Ukupno jedinica</span>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full">
                <div className="text-center">
                  <Scale size={24} className="mx-auto text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500 block">Kontrola kvaliteta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="bg-red-800 text-white text-xs uppercase py-2 px-2 text-left border border-red-800 w-16">ID</th>
                <th className="bg-red-800 text-white text-xs uppercase py-2 px-2 text-left border border-red-800 w-1/3">Artikal</th>
                <th className="bg-red-800 text-white text-xs uppercase py-2 px-2 text-center border border-red-800 w-20">Jedinica</th>
                <th className="bg-red-800 text-white text-xs uppercase py-2 px-2 text-center border border-red-800 w-20">Količina</th>
                <th className="bg-red-800 text-white text-xs uppercase py-2 px-2 text-left border border-red-800">Razlog</th>
                <th className="bg-red-800 text-white text-xs uppercase py-2 px-2 text-left border border-red-800">Napomena</th>
                <th className="bg-red-800 text-white text-xs uppercase py-2 px-2 text-center border border-red-800 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {currentEntry.items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={item.itemId}
                      onChange={(e) => updateItem(item.id, 'itemId', e.target.value)}
                      className="w-full py-2 px-2 outline-none text-center"
                      placeholder="#"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                      className="w-full py-2 px-2 outline-none"
                      placeholder="Naziv artikla"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      className="w-full py-2 px-2 outline-none bg-transparent text-center"
                    >
                      <option value="kg">kg</option>
                      <option value="l">l</option>
                      <option value="pcs">kom</option>
                    </select>
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full py-2 px-2 outline-none text-center font-bold"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <select
                      value={item.reason}
                      onChange={(e) => updateItem(item.id, 'reason', e.target.value)}
                      className="w-full py-2 px-2 outline-none bg-transparent"
                    >
                      {WASTE_REASONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      className="w-full py-2 px-2 outline-none"
                      placeholder="..."
                    />
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    {currentEntry.items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button 
            onClick={addItem}
            className="mb-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + Dodaj artikal
          </button>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <AlertCircle size={14} /> Otpis po razlogu
              </h4>
              <div className="space-y-1">
                {totalByReason.map(reason => (
                  <div key={reason.value} className="flex justify-between text-sm">
                    <span>{reason.label}</span>
                    <span className="font-medium">{reason.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Napomene</label>
              <textarea
                value={currentEntry.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="input min-h-[60px] resize-none"
                placeholder="Opšte napomene..."
              />
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 print:border-t-2 print:border-black">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ŠEF KUHINJE</label>
              <input
                type="text"
                value={currentEntry.kitchenSignature}
                onChange={(e) => handleInputChange('kitchenSignature', e.target.value)}
                className="input mb-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">MENADŽER</label>
              <input
                type="text"
                value={currentEntry.managerSignature}
                onChange={(e) => handleInputChange('managerSignature', e.target.value)}
                className="input mb-1"
              />
            </div>
          </div>

          <div className="hidden print:block mt-4 text-center text-xs text-slate-400">
            Generisano putem Shift Scheduler - {currentEntry.date}
          </div>
        </div>

        {/* History */}
        {entries.length > 1 && (
          <div className="mt-6 max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-3">Prethodni dani</h3>
            <div className="space-y-2">
              {entries.slice(1, 6).map((entry, idx) => (
                <div 
                  key={entry.id || idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                  onClick={() => setCurrentEntry(entry)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{entry.date}</span>
                    <span className="text-xs bg-red-100 px-2 py-0.5 rounded">{entry.items.length} stavki</span>
                    <span className="text-sm text-slate-600">{entry.totalValue} ukupno</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:border-t-2 { border-top-width: 2px !important; }
          .print\\:border-black { border-color: black !important; }
          body { background: white !important; }
          input, select, textarea { 
            border: none !important; 
            background: transparent !important; 
          }
          input:focus, select:focus, textarea:focus { outline: none !important; }
        }
      `}</style>
    </div>
  );
}
