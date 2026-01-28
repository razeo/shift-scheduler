import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Duty } from '../types';

interface EditDutyModalProps {
  duty: Duty;
  onClose: () => void;
  onUpdate: (duty: Duty) => void;
}

const EditDutyModal: React.FC<EditDutyModalProps> = ({ duty, onClose, onUpdate }) => {
  const [label, setLabel] = useState(duty.label);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onUpdate({ ...duty, label: label.trim() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Uredi naziv dužnosti</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Naziv</label>
            <input 
              type="text" 
              value={label} 
              onChange={(e) => setLabel(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">
            Sačuvaj izmjene
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDutyModal;
