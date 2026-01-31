// ===========================================
// Shift Handover Component
// Primopredaja smjene - Continuity Log
// ===========================================

import { useState, useRef, useEffect } from 'react';
import { Printer, Save, RotateCcw, Check, X, FileText } from 'lucide-react';
import { formatDateToId } from '../../utils/date';

interface HandoverEntry {
  id: string;
  date: string;
  fromShift: 'I' | 'II';
  fromManager: string;
  toManager: string;
  
  // Finance & Documentation
  reservedTables: string;
  vipArrivals: string;
  cashStatus: string;
  reportSubmitted: boolean;
  otherDocs: string;
  
  // Inventory & Technical
  missingItems: string;
  technicalIssues: string;
  restockNeeded: string;
  inventoryChecked: boolean;
  cleanlinessOk: boolean;
  
  // Key Messages
  specialRequests: string;
  
  // Checklist
  briefingDone: boolean;
  keysHandedOver: boolean;
  posOk: boolean;
  hygieneOk: boolean;
  
  // Signatures
  fromSignature: string;
  toSignature: string;
  createdAt: number;
}

interface ShiftHandoverProps {
  onClose?: () => void;
}

export function ShiftHandover({ onClose }: ShiftHandoverProps) {
  const [entries, setEntries] = useState<HandoverEntry[]>(() => {
    try {
      const stored = localStorage.getItem('shift_handover_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  
  const [currentEntry, setCurrentEntry] = useState<HandoverEntry>({
    id: '',
    date: formatDateToId(new Date()),
    fromShift: 'I',
    fromManager: '',
    toManager: '',
    reservedTables: '',
    vipArrivals: '',
    cashStatus: '',
    reportSubmitted: false,
    otherDocs: '',
    missingItems: '',
    technicalIssues: '',
    restockNeeded: '',
    inventoryChecked: false,
    cleanlinessOk: false,
    specialRequests: '',
    briefingDone: false,
    keysHandedOver: false,
    posOk: false,
    hygieneOk: false,
    fromSignature: '',
    toSignature: '',
    createdAt: Date.now(),
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Load today's entry if exists
  useEffect(() => {
    const today = formatDateToId(new Date());
    const existing = entries.find(e => e.date === today);
    if (existing) {
      setCurrentEntry(existing);
    }
  }, [entries]);

  const handleInputChange = (field: keyof HandoverEntry, value: any) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const entry: HandoverEntry = {
      ...currentEntry,
      id: currentEntry.id || `handover-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updated = entries.filter(e => e.date !== entry.date);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('shift_handover_entries', JSON.stringify(updated));
    setIsSaved(true);
    
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNew = () => {
    setCurrentEntry({
      id: '',
      date: formatDateToId(new Date()),
      fromShift: currentEntry.fromShift === 'I' ? 'II' : 'I',
      fromManager: '',
      toManager: '',
      reservedTables: '',
      vipArrivals: '',
      cashStatus: '',
      reportSubmitted: false,
      otherDocs: '',
      missingItems: '',
      technicalIssues: '',
      restockNeeded: '',
      inventoryChecked: false,
      cleanlinessOk: false,
      specialRequests: '',
      briefingDone: false,
      keysHandedOver: false,
      posOk: false,
      hygieneOk: false,
      fromSignature: '',
      toSignature: '',
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
          <div className="p-2 bg-primary-100 rounded-lg">
            <FileText size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Primopredaja Smjene</h1>
            <p className="text-xs text-slate-500">Shift Handover & Continuity Log</p>
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
          
          {/* Header - Print Only */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold text-center uppercase">Primopredaja Smjene</h1>
            <p className="text-center text-sm text-slate-500">Shift Handover & Continuity Log</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-3 gap-4 mb-6 print:grid-cols-3">
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Smjena</label>
              <select
                value={currentEntry.fromShift}
                onChange={(e) => handleInputChange('fromShift', e.target.value)}
                className="input"
              >
                <option value="I">I (06:00 - 14:00)</option>
                <option value="II">II (14:00 - 22:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Menadžer</label>
              <input
                type="text"
                value={currentEntry.fromManager}
                onChange={(e) => handleInputChange('fromManager', e.target.value)}
                placeholder="Ime i prezime"
                className="input"
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Finance & Documentation */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText size={16} /> Finansije i Dokumentacija
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Rezervisani stolovi</label>
                  <input
                    type="text"
                    value={currentEntry.reservedTables}
                    onChange={(e) => handleInputChange('reservedTables', e.target.value)}
                    className="input"
                    placeholder="npr. Stolovi 5, 7, 12"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">VIP dolasci / Sobe</label>
                  <input
                    type="text"
                    value={currentEntry.vipArrivals}
                    onChange={(e) => handleInputChange('vipArrivals', e.target.value)}
                    className="input"
                    placeholder="npr. Gost X, Soba 205"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Stanje kase (Depozit)</label>
                  <input
                    type="text"
                    value={currentEntry.cashStatus}
                    onChange={(e) => handleInputChange('cashStatus', e.target.value)}
                    className="input"
                    placeholder="€ iznos"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reportSubmitted"
                    checked={currentEntry.reportSubmitted}
                    onChange={(e) => handleInputChange('reportSubmitted', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="reportSubmitted" className="text-sm">Izvještaj kase predat</label>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Ostala dokumentacija</label>
                  <input
                    type="text"
                    value={currentEntry.otherDocs}
                    onChange={(e) => handleInputChange('otherDocs', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Inventory & Technical */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText size={16} /> Inventar i Tehnika
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Nedostajući artikli</label>
                  <input
                    type="text"
                    value={currentEntry.missingItems}
                    onChange={(e) => handleInputChange('missingItems', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Tehnički kvarovi</label>
                  <input
                    type="text"
                    value={currentEntry.technicalIssues}
                    onChange={(e) => handleInputChange('technicalIssues', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Potrebna dopuna (Bar/Kuhinja)</label>
                  <input
                    type="text"
                    value={currentEntry.restockNeeded}
                    onChange={(e) => handleInputChange('restockNeeded', e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inventoryChecked"
                    checked={currentEntry.inventoryChecked}
                    onChange={(e) => handleInputChange('inventoryChecked', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="inventoryChecked" className="text-sm">Provjera sitnog inventara</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cleanlinessOk"
                    checked={currentEntry.cleanlinessOk}
                    onChange={(e) => handleInputChange('cleanlinessOk', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="cleanlinessOk" className="text-sm">Čistoća radnih stanica</label>
                </div>
              </div>
            </div>
          </div>

          {/* Key Messages - Full Width */}
          <div className="border border-slate-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText size={16} /> Ključne poruke i specijalni zahtjevi
            </h3>
            <textarea
              value={currentEntry.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="Unesite specifične zahtjeve gostiju, eventualna kašnjenja ili važne napomene..."
            />
          </div>

          {/* Checklist */}
          <div className="border border-slate-200 rounded-lg p-4 mb-6 bg-slate-50 print:bg-white">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Check size={16} /> Potvrda primopredaje
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'briefingDone' as const, label: 'Brifing završen' },
                { key: 'keysHandedOver' as const, label: 'Ključevi predati' },
                { key: 'posOk' as const, label: 'POS sistem OK' },
                { key: 'hygieneOk' as const, label: 'Higijena OK' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={currentEntry[item.key]}
                    onChange={(e) => handleInputChange(item.key, e.target.checked)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 print:border-t-2 print:border-black">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Predao (odlazeća smjena)</label>
              <input
                type="text"
                value={currentEntry.fromSignature}
                onChange={(e) => handleInputChange('fromSignature', e.target.value)}
                placeholder="Potpis"
                className="input mb-1"
              />
              <p className="text-xs text-slate-400">Ime i prezime</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primio (dolazeća smjena)</label>
              <input
                type="text"
                value={currentEntry.toSignature}
                onChange={(e) => handleInputChange('toSignature', e.target.value)}
                placeholder="Potpis"
                className="input mb-1"
              />
              <p className="text-xs text-slate-400">Ime i prezime</p>
            </div>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-6 text-center text-xs text-slate-400">
            Generisano putem Shift Scheduler - {formatDateToId(new Date())}
          </div>
        </div>

        {/* History */}
        {entries.length > 1 && (
          <div className="mt-6 max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-3">Prethodne primopredaje</h3>
            <div className="space-y-2">
              {entries.slice(1, 6).map((entry, idx) => (
                <div 
                  key={entry.id || idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                  onClick={() => setCurrentEntry(entry)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{entry.date}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">Smjena {entry.fromShift}</span>
                    <span className="text-sm text-slate-600">{entry.fromManager}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {entry.briefingDone && entry.keysHandedOver && entry.posOk && entry.hygieneOk ? '✓ Kompletno' : '⚠ Nepotpun'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:border-t-2 { border-top-width: 2px !important; }
          .print\\:border-black { border-color: black !important; }
          body { background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
