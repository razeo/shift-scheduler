// ===========================================
// Plan Odgovornosti (Responsibility Plan)
// Dnevno planiranje timova po sektorima
// ===========================================

import { useState, useRef, useEffect } from 'react';
import { Printer, Save, RotateCcw, Check, X, Users, ArrowLeft } from 'lucide-react';
import { formatDateToId } from '../../utils/date';

interface ResponsibilityEntry {
  id: string;
  date: string;
  shift: 'I' | 'II';
  
  assignments: {
    id: number;
    name: string;
    section: string;
    arrival: string;
    departure: string;
    sideWork: string;
    notes: string;
  }[];
  
  shiftLeader: string;
  notes: string;
  
  createdAt: number;
}

interface ResponsibilityPlanProps {
  onClose?: () => void;
}

const SECTIONS = [
  'Restoran - Main',
  'Restoran - Terrace',
  'Restoran - VIP',
  'Šank',
  'Bar',
  'Kuhinja - Topla',
  'Kuhinja - Hladna',
  'Kuhinja - Pastry',
  'Posuđe',
  'Hladnjača',
];

export function ResponsibilityPlan({ onClose }: ResponsibilityPlanProps) {
  const [entries, setEntries] = useState<ResponsibilityEntry[]>(() => {
    try {
      const stored = localStorage.getItem('responsibility_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });
  
  const [currentEntry, setCurrentEntry] = useState<ResponsibilityEntry>({
    id: '',
    date: formatDateToId(new Date()),
    shift: 'I',
    assignments: [
      { id: 1, name: '', section: '', arrival: '', departure: '', sideWork: '', notes: '' },
    ],
    shiftLeader: '',
    notes: '',
    createdAt: Date.now(),
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = formatDateToId(new Date());
    const existing = entries.find(e => e.date === today && e.shift === currentEntry.shift);
    if (existing) {
      
      setCurrentEntry(existing);
    }
  }, [entries, currentEntry.shift]);

  const handleInputChange = (field: keyof ResponsibilityEntry, value: string) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const addAssignment = () => {
    setCurrentEntry(prev => ({
      ...prev,
      assignments: [...prev.assignments, { 
        id: Date.now(), 
        name: '', 
        section: '', 
        arrival: '', 
        departure: '', 
        sideWork: '', 
        notes: '' 
      }]
    }));
    setIsSaved(false);
  };

  const updateAssignment = (id: number, field: string, value: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      assignments: prev.assignments.map(assignment => 
        assignment.id === id ? { ...assignment, [field]: value } : assignment
      )
    }));
    setIsSaved(false);
  };

  const removeAssignment = (id: number) => {
    if (currentEntry.assignments.length > 1) {
      setCurrentEntry(prev => ({
        ...prev,
        assignments: prev.assignments.filter(a => a.id !== id)
      }));
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    const entry: ResponsibilityEntry = {
      ...currentEntry,
      id: currentEntry.id || `resp-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updated = entries.filter(e => e.date !== entry.date || e.shift !== entry.shift);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('responsibility_entries', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNew = () => {
    setCurrentEntry({
      id: '',
      date: formatDateToId(new Date()),
      shift: currentEntry.shift === 'I' ? 'II' : 'I',
      assignments: [
        { id: 1, name: '', section: '', arrival: '', departure: '', sideWork: '', notes: '' },
      ],
      shiftLeader: '',
      notes: '',
      createdAt: Date.now(),
    });
    setIsSaved(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const shiftLabel = currentEntry.shift === 'I' ? 'I - Jutarnja smjena' : 'II - Večernja smjena';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Povratak na raspored"><ArrowLeft size={20} className="text-slate-600" /></button><div className="p-2 bg-blue-100 rounded-lg">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Plan Odgovornosti</h1>
            <p className="text-xs text-slate-500">Dnevno planiranje timova</p>
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
        <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-5xl mx-auto">
          
          {/* Print Header */}
          <div className="hidden print:block mb-4 text-center">
            <h1 className="text-2xl font-bold uppercase">Plan Odgovornosti</h1>
            <p className="text-sm text-slate-500">{shiftLabel} - {currentEntry.date}</p>
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
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Smjena</label>
              <select
                value={currentEntry.shift}
                onChange={(e) => handleInputChange('shift', e.target.value)}
                className="input"
              >
                <option value="I">I - Jutarnja</option>
                <option value="II">II - Večernja</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shift Leader</label>
              <input
                type="text"
                value={currentEntry.shiftLeader}
                onChange={(e) => handleInputChange('shiftLeader', e.target.value)}
                placeholder="Ime i prezime"
                className="input"
              />
            </div>
            <div className="flex items-end">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 w-full text-center">
                <span className="text-xs text-blue-600 font-medium">{shiftLabel}</span>
              </div>
            </div>
          </div>

          {/* Assignments Table */}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-left border border-slate-800 w-1/4">Ime i prezime</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-left border border-slate-800 w-1/4">Sektor / Reon</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-center border border-slate-800 w-20">Dolazak</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-center border border-slate-800 w-20">Odlazak</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-left border border-slate-800">Ključni zadaci (Side-work)</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-left border border-slate-800 w-24">Napomene</th>
                <th className="bg-slate-800 text-white text-xs uppercase py-2 px-2 text-center border border-slate-800 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {currentEntry.assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={assignment.name}
                      onChange={(e) => updateAssignment(assignment.id, 'name', e.target.value)}
                      className="w-full py-2 px-2 outline-none"
                      placeholder="Ime i prezime"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <select
                      value={assignment.section}
                      onChange={(e) => updateAssignment(assignment.id, 'section', e.target.value)}
                      className="w-full py-2 px-2 outline-none bg-transparent"
                    >
                      <option value="">Odaberite...</option>
                      {SECTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="time"
                      value={assignment.arrival}
                      onChange={(e) => updateAssignment(assignment.id, 'arrival', e.target.value)}
                      className="w-full py-2 px-2 outline-none text-center"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="time"
                      value={assignment.departure}
                      onChange={(e) => updateAssignment(assignment.id, 'departure', e.target.value)}
                      className="w-full py-2 px-2 outline-none text-center"
                    />
                  </td>
                  <td className="border border-slate-300 p-1 bg-blue-50">
                    <input
                      type="text"
                      value={assignment.sideWork}
                      onChange={(e) => updateAssignment(assignment.id, 'sideWork', e.target.value)}
                      className="w-full py-2 px-2 outline-none bg-transparent"
                      placeholder="Npr. Dnevno čišćenje, Dopuna, Priprema..."
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={assignment.notes}
                      onChange={(e) => updateAssignment(assignment.id, 'notes', e.target.value)}
                      className="w-full py-2 px-2 outline-none"
                      placeholder="..."
                    />
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    {currentEntry.assignments.length > 1 && (
                      <button
                        onClick={() => removeAssignment(assignment.id)}
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
            onClick={addAssignment}
            className="mb-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + Dodaj radnika
          </button>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Users size={14} /> Ukupno: {currentEntry.assignments.length} radnika
              </h4>
              <div className="text-sm text-slate-600">
                {SECTIONS.map(section => {
                  const count = currentEntry.assignments.filter(a => a.section === section).length;
                  if (count === 0) return null;
                  return (
                    <div key={section} className="flex justify-between py-1">
                      <span>{section}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dodatne napomene</label>
              <textarea
                value={currentEntry.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="input min-h-[80px] resize-none"
                placeholder="Posebni zahtjevi, rezervacije, VIP gosti..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200 print:border-t-2 print:border-black">
            <div className="text-sm text-slate-500">
              <span className="font-medium">Shift Leader:</span> {currentEntry.shiftLeader || '_____'}
            </div>
            <div className="text-xs text-slate-400 print:hidden">
              Automatski spremljeno u localStorage
            </div>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-4 text-center text-xs text-slate-400">
            Generisano putem RestoHub - {currentEntry.date} {shiftLabel}
          </div>
        </div>

        {/* History */}
        {entries.length > 1 && (
          <div className="mt-6 max-w-5xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-3">Prethodni planovi</h3>
            <div className="space-y-2">
              {entries.slice(1, 6).map((entry, idx) => (
                <div 
                  key={entry.id || idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                  onClick={() => setCurrentEntry(entry)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{entry.date}</span>
                    <span className="text-xs bg-blue-100 px-2 py-0.5 rounded">{entry.shift}. smjena</span>
                    <span className="text-sm text-slate-600">{entry.assignments.length} radnika</span>
                    <span className="text-sm text-slate-500">Leader: {entry.shiftLeader || '-'}</span>
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
