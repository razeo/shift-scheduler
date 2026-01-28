import React, { useState } from 'react';
import { X, Briefcase, Zap } from 'lucide-react';
import { Assignment, Employee, Duty } from '../types';

interface EditAssignmentModalProps {
  assignment: Assignment;
  employee: Employee | undefined;
  duties: Duty[];
  onClose: () => void;
  onUpdate: (id: string, specialDuty: string) => void;
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({ assignment, employee, duties, onClose, onUpdate }) => {
  const [duty, setDuty] = useState(assignment.specialDuty || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(assignment.id, duty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Posebna dužnost</h3>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{employee?.name || 'Radnik'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                <Briefcase size={14} className="text-indigo-500" />
                Unos dužnosti
              </label>
              <input 
                type="text" 
                placeholder="npr. Roštilj, Šank, Reon 1..."
                value={duty} 
                onChange={(e) => setDuty(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition-all font-semibold text-slate-700 placeholder:text-slate-400"
                autoFocus
              />
            </div>

            {duties.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  Brzi odabir
                </label>
                <div className="flex flex-wrap gap-2">
                  {duties.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDuty(d.label)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        duty === d.label 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-3">
             <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition border border-transparent"
            >
              Odustani
            </button>
            <button 
              type="submit" 
              className="flex-[2] py-3 bg-indigo-600 text-white font-black text-sm rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
            >
              Sačuvaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssignmentModal;