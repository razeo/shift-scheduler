import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Employee, Role, DayOfWeek } from '../types';
import { DAYS_ORDER } from '../constants';

interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onUpdate: (employee: Employee) => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ employee, onClose, onUpdate }) => {
  const [name, setName] = useState(employee.name);
  const [role, setRole] = useState<Role>(employee.role);
  const [availability, setAvailability] = useState<DayOfWeek[]>(employee.availability || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...employee, name, role, availability });
    onClose();
  };

  const toggleDay = (day: DayOfWeek) => {
    setAvailability(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Uredi radnika</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ime i prezime</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Uloga</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-indigo-500" />
              Dostupnost (Dani kada radnik može raditi)
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_ORDER.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border ${
                    availability.includes(day)
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
                  }`}
                  title={day}
                >
                  {day.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
            Sačuvaj izmjene
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
