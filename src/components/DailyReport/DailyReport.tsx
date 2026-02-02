// ===========================================
// Daily Cash Report Component
// Izvještaj Pazara - Financijski pregled
// ===========================================

import { useState, useRef, useEffect } from 'react';
import { Printer, Save, RotateCcw, Check, X, DollarSign, CreditCard, Receipt, ArrowLeft } from 'lucide-react';
import { formatDateToId } from '../../utils/date';

interface DailyReportEntry {
  id: string;
  date: string;
  manager: string;
  
  // Finance columns
  cashIShift: string;
  cashIITShift: string;
  cashTotal: string;
  
  cardsIShift: string;
  cardsIITShift: string;
  cardsTotal: string;
  
  representationIShift: string;
  representationIITShift: string;
  representationTotal: string;
  
  totalPazar: string;
  
  // Tip payout
  tipNetAmount: string;
  tipReceiver: string;
  
  // Cash control
  xReport: string;
  actualCash: string;
  difference: string;
  
  // Signatures
  chefISignature: string;
  chefIISignature: string;
  managementSignature: string;
  
  createdAt: number;
}

interface DailyReportProps {
  onClose?: () => void;
}

export function DailyReport({ onClose }: DailyReportProps) {
  const [entries, setEntries] = useState<DailyReportEntry[]>(() => {
    try {
      const stored = localStorage.getItem('daily_report_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  
  const [currentEntry, setCurrentEntry] = useState<DailyReportEntry>({
    id: '',
    date: formatDateToId(new Date()),
    manager: '',
    cashIShift: '',
    cashIITShift: '',
    cashTotal: '',
    cardsIShift: '',
    cardsIITShift: '',
    cardsTotal: '',
    representationIShift: '',
    representationIITShift: '',
    representationTotal: '',
    totalPazar: '',
    tipNetAmount: '',
    tipReceiver: '',
    xReport: '',
    actualCash: '',
    difference: '',
    chefISignature: '',
    chefIISignature: '',
    managementSignature: '',
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

  const handleInputChange = (field: keyof DailyReportEntry, value: string) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
    
    // Auto-calculate totals
    const cash1 = parseFloat(currentEntry.cashIShift) || 0;
    const cash2 = parseFloat(currentEntry.cashIITShift) || 0;
    setCurrentEntry(prev => ({ ...prev, cashTotal: String(cash1 + cash2) }));
    
    const cards1 = parseFloat(currentEntry.cardsIShift) || 0;
    const cards2 = parseFloat(currentEntry.cardsIITShift) || 0;
    setCurrentEntry(prev => ({ ...prev, cardsTotal: String(cards1 + cards2) }));
    
    const rep1 = parseFloat(currentEntry.representationIShift) || 0;
    const rep2 = parseFloat(currentEntry.representationIITShift) || 0;
    setCurrentEntry(prev => ({ ...prev, representationTotal: String(rep1 + rep2) }));
    
    const cash = parseFloat(currentEntry.cashTotal) || 0;
    const cards = parseFloat(currentEntry.cardsTotal) || 0;
    const rep = parseFloat(currentEntry.representationTotal) || 0;
    setCurrentEntry(prev => ({ ...prev, totalPazar: String(cash + cards + rep) }));
    
    const x = parseFloat(currentEntry.xReport) || 0;
    const actual = parseFloat(currentEntry.actualCash) || 0;
    setCurrentEntry(prev => ({ ...prev, difference: String(actual - x) }));
  };

  const handleSave = () => {
    const entry: DailyReportEntry = {
      ...currentEntry,
      id: currentEntry.id || `report-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updated = entries.filter(e => e.date !== entry.date);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('daily_report_entries', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNew = () => {
    setCurrentEntry({
      id: '',
      date: formatDateToId(new Date()),
      manager: '',
      cashIShift: '',
      cashIITShift: '',
      cashTotal: '',
      cardsIShift: '',
      cardsIITShift: '',
      cardsTotal: '',
      representationIShift: '',
      representationIITShift: '',
      representationTotal: '',
      totalPazar: '',
      tipNetAmount: '',
      tipReceiver: '',
      xReport: '',
      actualCash: '',
      difference: '',
      chefISignature: '',
      chefIISignature: '',
      managementSignature: '',
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
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Povratak na raspored"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign size={20} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Izvještaj Pazara</h1>
            <p className="text-xs text-slate-500">Finansijski pregled i obračun tip-a</p>
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
            <RotateCcw size={16} /> Novi
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
          <div className="hidden print:block mb-4 text-center">
            <h1 className="text-2xl font-bold uppercase">Izvještaj Pazara</h1>
            <p className="text-sm text-slate-500">Finansijski pregled i obračun tip-a</p>
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
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Menadžer</label>
              <input
                type="text"
                value={currentEntry.manager}
                onChange={(e) => handleInputChange('manager', e.target.value)}
                placeholder="Ime i prezime"
                className="input"
              />
            </div>
          </div>

          {/* Main Table */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-3 text-left border border-slate-800">OPIS</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-3 text-center border border-slate-800 w-24">I SMJENA</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-3 text-center border border-slate-800 w-24">II SMJENA</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-3 text-center border border-slate-800 w-24">UKUPNO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 py-2 px-3 font-medium bg-slate-50">GOTOVINA</td>
                <td className="border border-slate-300">
                  <input
                    type="number"
                    value={currentEntry.cashIShift}
                    onChange={(e) => handleInputChange('cashIShift', e.target.value)}
                    className="w-full py-2 px-2 text-center outline-none"
                    placeholder="0.00"
                  />
                </td>
                <td className="border border-slate-300">
                  <input
                    type="number"
                    value={currentEntry.cashIITShift}
                    onChange={(e) => handleInputChange('cashIITShift', e.target.value)}
                    className="w-full py-2 px-2 text-center outline-none"
                    placeholder="0.00"
                  />
                </td>
                <td className="border border-slate-300 bg-slate-100">
                  <input
                    type="text"
                    value={currentEntry.cashTotal}
                    readOnly
                    className="w-full py-2 px-2 text-center outline-none bg-transparent font-bold"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 py-2 px-3 font-medium bg-slate-50">KARTICE</td>
                <td className="border border-slate-300">
                  <input
                    type="number"
                    value={currentEntry.cardsIShift}
                    onChange={(e) => handleInputChange('cardsIShift', e.target.value)}
                    className="w-full py-2 px-2 text-center outline-none"
                    placeholder="0.00"
                  />
                </td>
                <td className="border border-slate-300">
                  <input
                    type="number"
                    value={currentEntry.cardsIITShift}
                    onChange={(e) => handleInputChange('cardsIITShift', e.target.value)}
                    className="w-full py-2 px-2 text-center outline-none"
                    placeholder="0.00"
                  />
                </td>
                <td className="border border-slate-300 bg-slate-100">
                  <input
                    type="text"
                    value={currentEntry.cardsTotal}
                    readOnly
                    className="w-full py-2 px-2 text-center outline-none bg-transparent font-bold"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 py-2 px-3 font-medium bg-slate-50">REPREZENTACIJA</td>
                <td className="border border-slate-300">
                  <input
                    type="number"
                    value={currentEntry.representationIShift}
                    onChange={(e) => handleInputChange('representationIShift', e.target.value)}
                    className="w-full py-2 px-2 text-center outline-none"
                    placeholder="0.00"
                  />
                </td>
                <td className="border border-slate-300">
                  <input
                    type="number"
                    value={currentEntry.representationIITShift}
                    onChange={(e) => handleInputChange('representationIITShift', e.target.value)}
                    className="w-full py-2 px-2 text-center outline-none"
                    placeholder="0.00"
                  />
                </td>
                <td className="border border-slate-300 bg-slate-100">
                  <input
                    type="text"
                    value={currentEntry.representationTotal}
                    readOnly
                    className="w-full py-2 px-2 text-center outline-none bg-transparent font-bold"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-slate-800 py-3 px-3 font-bold bg-slate-800 text-white">UKUPAN PAZAR</td>
                <td className="border border-slate-800 bg-slate-100"></td>
                <td className="border border-slate-800 bg-slate-100"></td>
                <td className="border border-slate-800 bg-slate-200">
                  <input
                    type="text"
                    value={currentEntry.totalPazar}
                    readOnly
                    className="w-full py-2 px-2 text-center outline-none bg-transparent font-bold text-lg"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tip Section */}
          <div className="border border-slate-200 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CreditCard size={16} /> Isplata Tip-a (KARTICE)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Neto za isplatu (€)</label>
                <input
                  type="number"
                  value={currentEntry.tipNetAmount}
                  onChange={(e) => handleInputChange('tipNetAmount', e.target.value)}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Potpis primaoca</label>
                <input
                  type="text"
                  value={currentEntry.tipReceiver}
                  onChange={(e) => handleInputChange('tipReceiver', e.target.value)}
                  className="input"
                  placeholder="Ime i prezime"
                />
              </div>
            </div>
          </div>

          {/* Cash Control Section */}
          <div className="border border-slate-200 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Receipt size={16} /> Kontrola Kase
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">X-Izvještaj (€)</label>
                <input
                  type="number"
                  value={currentEntry.xReport}
                  onChange={(e) => handleInputChange('xReport', e.target.value)}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Stvarno stanje (€)</label>
                <input
                  type="number"
                  value={currentEntry.actualCash}
                  onChange={(e) => handleInputChange('actualCash', e.target.value)}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1 text-red-600 font-bold">Razlika (€)</label>
                <input
                  type="text"
                  value={currentEntry.difference}
                  readOnly
                  className={`input font-bold ${parseFloat(currentEntry.difference) !== 0 ? 'text-red-600' : ''}`}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200 print:border-t-2 print:border-black">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ŠEF I</label>
              <input
                type="text"
                value={currentEntry.chefISignature}
                onChange={(e) => handleInputChange('chefISignature', e.target.value)}
                className="input mb-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ŠEF II</label>
              <input
                type="text"
                value={currentEntry.chefIISignature}
                onChange={(e) => handleInputChange('chefIISignature', e.target.value)}
                className="input mb-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">UPRAVA</label>
              <input
                type="text"
                value={currentEntry.managementSignature}
                onChange={(e) => handleInputChange('managementSignature', e.target.value)}
                className="input mb-1"
              />
            </div>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-4 text-center text-xs text-slate-400">
            Generisano putem RestoHub - {formatDateToId(new Date())}
          </div>
        </div>

        {/* History */}
        {entries.length > 1 && (
          <div className="mt-6 max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-3">Prethodni izvještaji</h3>
            <div className="space-y-2">
              {entries.slice(1, 6).map((entry, idx) => (
                <div 
                  key={entry.id || idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                  onClick={() => setCurrentEntry(entry)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{entry.date}</span>
                    <span className="text-sm text-slate-600">€ {entry.totalPazar || '0'}</span>
                    <span className="text-sm text-slate-500">{entry.manager}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {parseFloat(entry.difference) === 0 ? '✓ OK' : `⚠ ${entry.difference}`}
                  </span>
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
          input { border: none !important; background: transparent !important; }
          input:focus { outline: none !important; }
        }
      `}</style>
    </div>
  );
}
