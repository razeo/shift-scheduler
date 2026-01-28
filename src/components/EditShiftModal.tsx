import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { DayOfWeek, Shift } from '../types';
import { DAYS_ORDER } from '../constants';

interface EditShiftModalProps {
  shift: Shift;
  onClose: () => void;
  onUpdate: (shift: Shift) => void;
}

const EditShiftModal: React.FC<EditShiftModalProps> = ({ shift, onClose, onUpdate }) => {
  const [day, setDay] = useState<DayOfWeek>(shift.day);
  const [startTime, setStartTime] = useState(shift.startTime);
  const [endTime, setEndTime] = useState(shift.endTime);
  const [label, setLabel] = useState(shift.label);
  const [notes, setNotes] = useState(shift.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...shift, day, startTime, endTime, label, notes: notes.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Uredi smjenu</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dan</label>
            <select 
              value={day} 
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {DAYS_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Početak</label>
              <input 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kraj</label>
              <input 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Naziv smjene</label>
            <input 
              type="text" 
              value={label} 
              onChange={(e) => setLabel(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <FileText size={14} className="text-slate-400" />
              Napomena
            </label>
            <textarea 
              placeholder="Dodaj napomenu za ovu smjenu..."
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] text-sm resize-none" 
            />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            Sačuvaj izmjene
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditShiftModal;
