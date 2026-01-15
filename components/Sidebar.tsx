import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, Trash2, Edit2, UserCircle, Briefcase, Settings2, Save } from 'lucide-react';
import { Employee, Role, Duty, DayOfWeek } from '../types';
import { DAYS_ORDER } from '../constants';
import EditEmployeeModal from './EditEmployeeModal';
import EditDutyModal from './EditDutyModal';

interface SidebarProps {
  employees: Employee[];
  duties: Duty[];
  aiRules: string;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onRemoveEmployee: (id: string) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onAddDuty: (duty: Omit<Duty, 'id'>) => void;
  onRemoveDuty: (id: string) => void;
  onUpdateDuty: (duty: Duty) => void;
  onUpdateAiRules: (rules: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  employees, 
  duties, 
  aiRules,
  onAddEmployee, 
  onRemoveEmployee, 
  onUpdateEmployee,
  onAddDuty,
  onRemoveDuty,
  onUpdateDuty,
  onUpdateAiRules
}) => {
  const [isAddingEmp, setIsAddingEmp] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<Role>(Role.SERVER);
  const [newEmpAvailability, setNewEmpAvailability] = useState<DayOfWeek[]>(DAYS_ORDER);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isAddingDuty, setIsAddingDuty] = useState(false);
  const [newDutyLabel, setNewDutyLabel] = useState('');
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);

  const [isEditingRules, setIsEditingRules] = useState(false);
  const [tempRules, setTempRules] = useState(aiRules);

  // Ključno: Sinhronizuj tempRules kada se aiRules promijeni spolja (npr. učitavanje iz localStorage)
  useEffect(() => {
    if (!isEditingRules) {
      setTempRules(aiRules);
    }
  }, [aiRules, isEditingRules]);

  const handleAddEmp = () => {
    if (newEmpName.trim()) {
      onAddEmployee({ name: newEmpName, role: newEmpRole, availability: newEmpAvailability });
      setNewEmpName('');
      setNewEmpAvailability(DAYS_ORDER);
      setIsAddingEmp(false);
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    setNewEmpAvailability(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddDuty = () => {
    if (newDutyLabel.trim()) {
      onAddDuty({ label: newDutyLabel });
      setNewDutyLabel('');
      setIsAddingDuty(false);
    }
  };

  const handleSaveRules = () => {
    onUpdateAiRules(tempRules);
    setIsEditingRules(false);
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 h-screen flex flex-col shadow-lg z-50">
      <div className="p-6 border-b border-slate-100 bg-indigo-600 text-white shrink-0">
        <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight">
          <Calendar className="w-8 h-8" />
          ShiftMaster
        </h1>
        <p className="text-xs text-indigo-100 font-medium opacity-80 mt-1 uppercase tracking-widest">Restaurant Suite</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* AI RULES SECTION */}
        <div>
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Settings2 size={14} /> Instrukcije za AI
            </h2>
            <button 
              onClick={() => {
                if(isEditingRules) handleSaveRules();
                else setIsEditingRules(true);
              }}
              className={`${isEditingRules ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} p-1.5 rounded-lg transition`}
            >
              {isEditingRules ? <Save size={18} /> : <Edit2 size={18} />}
            </button>
          </div>
          
          <div className={`p-3 rounded-xl border transition-all ${isEditingRules ? 'bg-white border-indigo-200 shadow-md ring-2 ring-indigo-50' : 'bg-slate-50 border-slate-100'}`}>
            {isEditingRules ? (
              <textarea 
                className="w-full text-xs font-medium text-slate-700 bg-transparent border-none outline-none resize-none min-h-[100px]"
                value={tempRules}
                onChange={(e) => setTempRules(e.target.value)}
                placeholder="Napišite pravila koja želite da AI prati (npr. 'Uvijek 2 konobara petkom')..."
                autoFocus
              />
            ) : (
              <p className="text-[11px] text-slate-500 italic leading-relaxed">
                {aiRules || "Nema definisanih pravila. Kliknite na olovku da dodate svoja pravila."}
              </p>
            )}
          </div>
        </div>

        {/* EMPLOYEES SECTION */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> Osoblje
            </h2>
            <button 
              onClick={() => setIsAddingEmp(!isAddingEmp)}
              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-1.5 rounded-lg transition"
            >
              <Plus size={18} />
            </button>
          </div>

          {isAddingEmp && (
            <div className="bg-slate-50 p-3 rounded-xl border border-indigo-100 mb-4 shadow-sm animate-in slide-in-from-top-2 space-y-3">
              <input
                type="text"
                placeholder="Ime radnika"
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newEmpName}
                onChange={(e) => setNewEmpName(e.target.value)}
              />
              <select
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newEmpRole}
                onChange={(e) => setNewEmpRole(e.target.value as Role)}
              >
                {Object.values(Role).map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dostupnost</p>
                <div className="flex flex-wrap gap-1">
                  {DAYS_ORDER.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all border ${
                        newEmpAvailability.includes(day)
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {day.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleAddEmp}
                  className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700"
                >
                  Dodaj
                </button>
                <button 
                  onClick={() => setIsAddingEmp(false)}
                  className="flex-1 bg-white text-slate-600 text-xs font-bold py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Odustani
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {employees.map((emp) => (
              <div key={emp.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-default">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                    emp.role === Role.CHEF ? 'bg-orange-100 text-orange-700' :
                    emp.role === Role.MANAGER ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {emp.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{emp.name}</p>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{emp.role}</p>
                       <div className="flex gap-0.5">
                          {DAYS_ORDER.map(d => (
                            <div 
                              key={d} 
                              className={`w-1 h-1 rounded-full ${emp.availability?.includes(d) ? 'bg-indigo-400' : 'bg-slate-200'}`}
                            />
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingEmployee(emp)}
                    className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => onRemoveEmployee(emp.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DUTIES SECTION */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={14} /> Dužnosti
            </h2>
            <button 
              onClick={() => setIsAddingDuty(!isAddingDuty)}
              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-1.5 rounded-lg transition"
            >
              <Plus size={18} />
            </button>
          </div>

          {isAddingDuty && (
            <div className="bg-slate-50 p-3 rounded-xl border border-indigo-100 mb-4 shadow-sm animate-in slide-in-from-top-2">
              <input
                type="text"
                placeholder="npr. Roštilj"
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newDutyLabel}
                onChange={(e) => setNewDutyLabel(e.target.value)}
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleAddDuty}
                  className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700"
                >
                  Dodaj
                </button>
                <button 
                  onClick={() => setIsAddingDuty(false)}
                  className="flex-1 bg-white text-slate-600 text-xs font-bold py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Odustani
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {duties.map((duty) => (
              <div key={duty.id} className="group flex items-center justify-between p-2 px-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <span className="text-xs font-semibold text-slate-700">{duty.label}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingDuty(duty)}
                    className="text-slate-400 hover:text-indigo-600 p-1 transition"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={() => onRemoveDuty(duty.id)}
                    className="text-slate-400 hover:text-red-600 p-1 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {editingEmployee && (
        <EditEmployeeModal 
          employee={editingEmployee} 
          onClose={() => setEditingEmployee(null)}
          onUpdate={onUpdateEmployee}
        />
      )}

      {editingDuty && (
        <EditDutyModal 
          duty={editingDuty} 
          onClose={() => setEditingDuty(null)}
          onUpdate={onUpdateDuty}
        />
      )}

      <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
          <UserCircle className="text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700">Administrator</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Upravljanje restoranom</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
