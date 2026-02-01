// ===========================================
// Dnevna Ponuda (Daily Menu)
// Dnevni meni - Couvert, Juha, Glavno jelo, Desert
// ===========================================

import { useState, useRef, useEffect } from 'react';
import { Printer, Save, RotateCcw, Check, X, Utensils, ChefHat, FileText } from 'lucide-react';
import { formatDateToId } from '../../utils/date';

interface DailyMenuEntry {
  id: string;
  date: string;
  
  couvert: string;
  
  soup: {
    name: string;
    extra: string;
  };
  
  mainCourse: {
    meat: string;
    fish: string;
    vegetarian: string;
  };
  
  desert: {
    sweet: string;
    fruit: string;
  };
  
  kitchenSupervisor: string;
  restaurantSupervisor: string;
  
  notes: string;
  
  createdAt: number;
}

interface DailyMenuProps {
  onClose?: () => void;
}

export function DailyMenu({ onClose }: DailyMenuProps) {
  const [entries, setEntries] = useState<DailyMenuEntry[]>(() => {
    try {
      const stored = localStorage.getItem('dailymenu_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  
  const [currentEntry, setCurrentEntry] = useState<DailyMenuEntry>({
    id: '',
    date: formatDateToId(new Date()),
    couvert: '',
    soup: { name: '', extra: '' },
    mainCourse: { meat: '', fish: '', vegetarian: '' },
    desert: { sweet: '', fruit: '' },
    kitchenSupervisor: '',
    restaurantSupervisor: '',
    notes: '',
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

  const handleInputChange = (field: string, value: any) => {
    setCurrentEntry(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    const entry: DailyMenuEntry = {
      ...currentEntry,
      id: currentEntry.id || `dm-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updated = entries.filter(e => e.date !== entry.date);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('dailymenu_entries', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNew = () => {
    setCurrentEntry({
      id: '',
      date: formatDateToId(new Date()),
      couvert: '',
      soup: { name: '', extra: '' },
      mainCourse: { meat: '', fish: '', vegetarian: '' },
      desert: { sweet: '', fruit: '' },
      kitchenSupervisor: '',
      restaurantSupervisor: '',
      notes: '',
      createdAt: Date.now(),
    });
    setIsSaved(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Utensils size={20} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Dnevna Ponuda</h1>
            <p className="text-xs text-slate-500">Dnevni meni</p>
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
            <h1 className="text-2xl font-bold uppercase">Dnevna Ponuda</h1>
            <p className="text-sm text-slate-500">{currentEntry.date}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
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
              <div className="p-2 bg-green-50 rounded-lg border border-green-200 w-full text-center">
                <Utensils size={20} className="mx-auto text-green-600" />
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          <div className="space-y-4">
            {/* Couvert */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16} /> COUVERT
              </h3>
              <input
                type="text"
                value={currentEntry.couvert}
                onChange={(e) => handleInputChange('couvert', e.target.value)}
                className="input w-full"
                placeholder="Kruh, maslinovo ulje, ajvar..."
              />
            </div>

            {/* Soup */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <ChefHat size={16} /> JUHA
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Juha</label>
                  <input
                    type="text"
                    value={currentEntry.soup.name}
                    onChange={(e) => handleInputChange('soup.name', e.target.value)}
                    className="input w-full"
                    placeholder="Naziv juhe"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Dodatak</label>
                  <input
                    type="text"
                    value={currentEntry.soup.extra}
                    onChange={(e) => handleInputChange('soup.extra', e.target.value)}
                    className="input w-full"
                    placeholder="Npr. Škampi, Krumpir..."
                  />
                </div>
              </div>
            </div>

            {/* Main Course */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Utensils size={16} /> GLAVNO JELO
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-red-600 mb-1">MESO</label>
                  <input
                    type="text"
                    value={currentEntry.mainCourse.meat}
                    onChange={(e) => handleInputChange('mainCourse.meat', e.target.value)}
                    className="input w-full"
                    placeholder="Meso..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-600 mb-1">RIBA</label>
                  <input
                    type="text"
                    value={currentEntry.mainCourse.fish}
                    onChange={(e) => handleInputChange('mainCourse.fish', e.target.value)}
                    className="input w-full"
                    placeholder="Riba..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-green-600 mb-1">VEGETARIJANSKO</label>
                  <input
                    type="text"
                    value={currentEntry.mainCourse.vegetarian}
                    onChange={(e) => handleInputChange('mainCourse.vegetarian', e.target.value)}
                    className="input w-full"
                    placeholder="Vegetarijansko..."
                  />
                </div>
              </div>
            </div>

            {/* Desert */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <ChefHat size={16} /> DESERT
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Slatko</label>
                  <input
                    type="text"
                    value={currentEntry.desert.sweet}
                    onChange={(e) => handleInputChange('desert.sweet', e.target.value)}
                    className="input w-full"
                    placeholder="Kolac, sladoled..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Voće</label>
                  <input
                    type="text"
                    value={currentEntry.desert.fruit}
                    onChange={(e) => handleInputChange('desert.fruit', e.target.value)}
                    className="input w-full"
                    placeholder="Voće..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Napomene / Posebna ponuda</label>
            <textarea
              value={currentEntry.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="input min-h-[60px] resize-none"
              placeholder="Specijalna ponuda, promjene..."
            />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t border-slate-200 print:border-t-2 print:border-black">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ŠEF KUHINJE</label>
              <input
                type="text"
                value={currentEntry.kitchenSupervisor}
                onChange={(e) => handleInputChange('kitchenSupervisor', e.target.value)}
                className="input mb-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ŠEF SALA</label>
              <input
                type="text"
                value={currentEntry.restaurantSupervisor}
                onChange={(e) => handleInputChange('restaurantSupervisor', e.target.value)}
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
                    <span className="text-xs bg-green-100 px-2 py-0.5 rounded">
                      {entry.mainCourse.meat || entry.mainCourse.fish || 'Menu'}
                    </span>
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
          input, textarea { 
            border: none !important; 
            background: transparent !important; 
          }
          input:focus, textarea:focus { outline: none !important; }
        }
      `}</style>
    </div>
  );
}
