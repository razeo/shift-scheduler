// ===========================================
// Out of Stock List (Lista 86)
// Dnevni izvještaj o nedostupnim artiklima
// ===========================================

import { useState, useRef, useEffect } from 'react';
import { Printer, Save, RotateCcw, Check, X, AlertTriangle, TrendingUp, ArrowLeft } from 'lucide-react';
import { formatDateToId } from '../../utils/date';

interface OutOfStockEntry {
  id: string;
  date: string;
  sector: string;
  responsible: string;
  
  items: {
    id: number;
    item: string;
    reason: 'nabavka' | 'kvalitet' | 'priprema';
    alternative: string;
    time86: string;
    returnTime: string;
  }[];
  
  briefingDone: boolean;
  fohInformed: boolean;
  barInformed: boolean;
  posUpdated: boolean;
  notes: string;
  
  kitchenSignature: string;
  managerSignature: string;
  
  createdAt: number;
}

interface OutOfStockProps {
  onClose?: () => void;
}

export function OutOfStock({ onClose }: OutOfStockProps) {
  const [entries, setEntries] = useState<OutOfStockEntry[]>(() => {
    try {
      const stored = localStorage.getItem('outofstock_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });
  
  const [currentEntry, setCurrentEntry] = useState<OutOfStockEntry>({
    id: '',
    date: formatDateToId(new Date()),
    sector: '',
    responsible: '',
    items: [{ id: 1, item: '', reason: 'nabavka', alternative: '', time86: '', returnTime: '' }],
    briefingDone: false,
    fohInformed: false,
    barInformed: false,
    posUpdated: false,
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

  const handleInputChange = (field: keyof OutOfStockEntry, value: string) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const addItem = () => {
    setCurrentEntry(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: Date.now(), 
        item: '', 
        reason: 'nabavka', 
        alternative: '', 
        time86: '', 
        returnTime: '' 
      }]
    }));
    setIsSaved(false);
  };

  const updateItem = (id: number, field: string, value: string) => {
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
    const entry: OutOfStockEntry = {
      ...currentEntry,
      id: currentEntry.id || `oos-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updated = entries.filter(e => e.date !== entry.date || e.sector !== entry.sector);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('outofstock_entries', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNew = () => {
    setCurrentEntry({
      id: '',
      date: formatDateToId(new Date()),
      sector: '',
      responsible: '',
      items: [{ id: 1, item: '', reason: 'nabavka', alternative: '', time86: '', returnTime: '' }],
      briefingDone: false,
      fohInformed: false,
      barInformed: false,
      posUpdated: false,
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

  const communicationItems = [
    { key: 'briefingDone' as const, label: 'Brifing obavljen' },
    { key: 'fohInformed' as const, label: 'Servis (FOH)' },
    { key: 'barInformed' as const, label: 'Šank' },
    { key: 'posUpdated' as const, label: 'POS ažuriran' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Povratak na raspored"><ArrowLeft size={20} className="text-slate-600" /></button><div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Lista 86</h1>
            <p className="text-xs text-slate-500">Nedostupni artikli i zamjene</p>
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

      <div className="flex-1 overflow-y-auto p-4">
        <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
          
          <div className="hidden print:block mb-4 text-center">
            <h1 className="text-2xl font-bold uppercase">Lista 86</h1>
            <p className="text-sm text-slate-500">Dnevni izvještaj o nedostupnim artiklima</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Datum</label>
              <input
                type="date"
                value={currentEntry.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sektor</label>
              <select
                value={currentEntry.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="input"
              >
                <option value="">Odaberite...</option>
                <option value="Kuhinja">Kuhinja</option>
                <option value="Bar">Bar</option>
                <option value="Restoran">Restoran</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Odgovorno lice</label>
              <input
                type="text"
                value={currentEntry.responsible}
                onChange={(e) => handleInputChange('responsible', e.target.value)}
                placeholder="Ime i prezime"
                className="input"
              />
            </div>
          </div>

          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-left border border-slate-800 w-1/3">Artikal (Van stanja)</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-center border border-slate-800 w-1/4">Razlog</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-left border border-slate-800 w-1/3">Preporučena zamjena</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-center border border-slate-800 w-20">Vrijeme</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-center border border-slate-800 w-20">Povratak</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-center border border-slate-800 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {currentEntry.items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                      className="w-full py-2 px-2 outline-none"
                      placeholder="Naziv artikla"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <select
                      value={item.reason}
                      onChange={(e) => updateItem(item.id, 'reason', e.target.value)}
                      className="w-full py-2 px-2 outline-none bg-transparent"
                    >
                      <option value="nabavka">Nabavka</option>
                      <option value="kvalitet">Kvalitet</option>
                      <option value="priprema">Priprema</option>
                    </select>
                  </td>
                  <td className="border border-slate-300 p-1 bg-yellow-50">
                    <input
                      type="text"
                      value={item.alternative}
                      onChange={(e) => updateItem(item.id, 'alternative', e.target.value)}
                      className="w-full py-2 px-2 outline-none bg-transparent"
                      placeholder="Upsell prilika..."
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="time"
                      value={item.time86}
                      onChange={(e) => updateItem(item.id, 'time86', e.target.value)}
                      className="w-full py-2 px-2 outline-none text-center"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="time"
                      value={item.returnTime}
                      onChange={(e) => updateItem(item.id, 'returnTime', e.target.value)}
                      className="w-full py-2 px-2 outline-none text-center"
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

          <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50 print:bg-white">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp size={16} /> Komunikacija
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {communicationItems.map(item => (
                <label key={item.key} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={currentEntry[item.key] as boolean}
                    onChange={(e) => handleInputChange(item.key, e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 text-amber-600"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-xs text-slate-600 mb-1">Dodatne napomene / Kontaktirani dobavljači</label>
              <textarea
                value={currentEntry.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="input min-h-[60px] resize-none"
                placeholder="Unesite napomene..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 print:border-t-2 print:border-black">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ŠEF KUHINJE / ŠANKA</label>
              <input
                type="text"
                value={currentEntry.kitchenSignature}
                onChange={(e) => handleInputChange('kitchenSignature', e.target.value)}
                className="input mb-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">MENADŽER SMJENE</label>
              <input
                type="text"
                value={currentEntry.managerSignature}
                onChange={(e) => handleInputChange('managerSignature', e.target.value)}
                className="input mb-1"
              />
            </div>
          </div>

          <div className="hidden print:block mt-4 text-center text-xs text-slate-400">
            Generisano putem RestoHub - {formatDateToId(new Date())}
          </div>
        </div>

        {entries.length > 1 && (
          <div className="mt-6 max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-3">Prethodne liste</h3>
            <div className="space-y-2">
              {entries.slice(1, 6).map((entry, idx) => (
                <div 
                  key={entry.id || idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                  onClick={() => setCurrentEntry(entry)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{entry.date}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{entry.sector}</span>
                    <span className="text-sm text-slate-600">{entry.items.length} artikala</span>
                    <span className="text-sm text-slate-500">{entry.responsible}</span>
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
          .print\\:bg-white { background-color: white !important; }
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
