import React, { useState, useEffect, useMemo } from 'react';
import { Users, Calendar, Plus, Trash2, Edit2, UserCircle, Briefcase, Settings2, Save, ListFilter, Clock, RotateCcw, Download, Upload, FileJson, PanelLeftClose } from 'lucide-react';
import { Employee, Role, Duty, DayOfWeek, Shift, Assignment } from '../types';
import { DAYS_ORDER } from '../constants';
import EditEmployeeModal from './EditEmployeeModal';
import EditDutyModal from './EditDutyModal';
import AddShiftModal from './AddShiftModal';
import EditShiftModal from './EditShiftModal';

interface SidebarProps {
  employees: Employee[];
  duties: Duty[];
  shifts: Shift[];
  assignments: Assignment[];
  aiRules: string;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onRemoveEmployee: (id: string) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onAddDuty: (duty: Omit<Duty, 'id'>) => void;
  onRemoveDuty: (id: string) => void;
  onUpdateDuty: (duty: Duty) => void;
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onRemoveShift: (id: string) => void;
  onUpdateShift: (shift: Shift) => void;
  onUpdateAiRules: (rules: string) => void;
  onResetAll?: () => void;
  onImportData?: (data: any) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  employees, 
  duties, 
  shifts,
  assignments,
  aiRules,
  onAddEmployee, 
  onRemoveEmployee, 
  onUpdateEmployee,
  onAddDuty,
  onRemoveDuty,
  onUpdateDuty,
  onAddShift,
  onRemoveShift,
  onUpdateShift,
  onUpdateAiRules,
  onResetAll,
  onImportData,
  onClose
}) => {
  const [isAddingEmp, setIsAddingEmp] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<Role>(Role.SERVER);
  const [newEmpAvailability, setNewEmpAvailability] = useState<DayOfWeek[]>(DAYS_ORDER);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isAddingDuty, setIsAddingDuty] = useState(false);
  const [newDutyLabel, setNewDutyLabel] = useState('');
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);

  const [isAddingShift, setIsAddingShift] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [isEditingRules, setIsEditingRules] = useState(false);
  const [tempRules, setTempRules] = useState(aiRules);

  const [sortBy, setSortBy] = useState<'name' | 'role'>('name');

  useEffect(() => {
    if (!isEditingRules) {
      setTempRules(aiRules);
    }
  }, [aiRules, isEditingRules]);

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.role.localeCompare(b.role) || a.name.localeCompare(b.name);
      }
    });
  }, [employees, sortBy]);

  const sortedShifts = useMemo(() => {
    return [...shifts].sort((a, b) => {
      const dayIndexA = DAYS_ORDER.indexOf(a.day);
      const dayIndexB = DAYS_ORDER.indexOf(b.day);
      if (dayIndexA !== dayIndexB) return dayIndexA - dayIndexB;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [shifts]);

  const handleExportBackup = () => {
    const backupData = {
      employees,
      shifts,
      duties,
      aiRules,
      assignments,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShiftMaster_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            onImportData?.(json);
          } catch (error) {
            alert("Nevažeći backup fajl.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleAddEmp = () => {
    if (newEmpName.trim()) {
      onAddEmployee({ name: newEmpName, role: newEmpRole, availability: newEmpAvailability });
      setNewEmpName('');
      setNewEmpAvailability(DAYS_ORDER);
      setIsAddingEmp(false);
    }
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

  const toggleSort = () => {
    setSortBy(prev => prev === 'name' ? 'role' : 'name');
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-6 border-b border-indigo-700 bg-indigo-600 text-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight">
            <Calendar className="w-8 h-8" />
            ShiftMaster
          </h1>
          <p className="text-xs text-indigo-100 font-medium opacity-80 mt-1 uppercase tracking-widest">Restaurant Suite</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 bg-indigo-500/50 hover:bg-indigo-500 rounded-lg transition-colors text-white/80 hover:text-white" title="Sakrij panel">
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-10">
        {/* BACKUP SECTION - NOVO I VAŽNO */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <FileJson size={14} className="text-indigo-500" /> Backup & Oporavak
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleExportBackup}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all text-slate-600 group"
              >
                <Download size={18} className="group-hover:text-indigo-600" />
                <span className="text-[9px] font-black uppercase">Preuzmi</span>
              </button>
              <button 
                onClick={handleImportClick}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all text-slate-600 group"
              >
                <Upload size={18} className="group-hover:text-emerald-600" />
                <span className="text-[9px] font-black uppercase">Učitaj</span>
              </button>
            </div>
        </div>

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
                placeholder="Napišite pravila koja želite da AI prati..."
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
            <div className="flex gap-2">
              <button 
                onClick={toggleSort}
                className={`p-1.5 rounded-lg transition flex items-center gap-1 text-[10px] font-bold uppercase ${
                  sortBy === 'role' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                }`}
              >
                <ListFilter size={14} />
                {sortBy}
              </button>
              <button 
                onClick={() => setIsAddingEmp(!isAddingEmp)}
                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-1.5 rounded-lg transition"
              >
                <Plus size={18} />
              </button>
            </div>
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
              
              <div className="flex gap-2">
                <button onClick={handleAddEmp} className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg">Dodaj</button>
                <button onClick={() => setIsAddingEmp(false)} className="flex-1 bg-white text-slate-600 text-xs font-bold py-2 rounded-lg border">Odustani</button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {sortedEmployees.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Nema radnika</p>
                <p className="text-[10px] text-slate-400 mt-1">Klikni + da dodaš prvog radnika</p>
              </div>
            ) : sortedEmployees.map((emp) => (
              <div key={emp.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${
                    emp.role === Role.CHEF ? 'bg-orange-100 text-orange-700' :
                    emp.role === Role.MANAGER ? 'bg-purple-100 text-purple-700' :
                    emp.role === Role.HEAD_WAITER ? 'bg-cyan-100 text-cyan-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {emp.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{emp.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{emp.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingEmployee(emp)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg transition">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onRemoveEmployee(emp.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SHIFTS SECTION */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} /> Definicije Smjena
            </h2>
            <button 
              onClick={() => setIsAddingShift(true)}
              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-1.5 rounded-lg transition"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {sortedShifts.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Nema smjena</p>
                <p className="text-[10px] text-slate-400 mt-1">Klikni + da dodaš prvu smjenu</p>
              </div>
            ) : sortedShifts.map((shift) => (
              <div key={shift.id} className="group flex items-center justify-between p-2.5 px-3 rounded-xl hover:bg-slate-50 border border-slate-100 bg-white shadow-sm transition-all">
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded leading-none">
                      {shift.day.charAt(0)}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">{shift.label}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <button onClick={() => setEditingShift(shift)} className="text-slate-400 hover:text-indigo-600 p-1 transition">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => onRemoveShift(shift.id)} className="text-slate-400 hover:text-red-600 p-1 transition">
                    <Trash2 size={12} />
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
                <button onClick={handleAddDuty} className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg">Dodaj</button>
                <button onClick={() => setIsAddingDuty(false)} className="flex-1 bg-white text-slate-600 text-xs font-bold py-2 rounded-lg border">Odustani</button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {duties.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Briefcase size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Nema dužnosti</p>
                <p className="text-[10px] text-slate-400 mt-1">Klikni + da dodaš prvu dužnost</p>
              </div>
            ) : duties.map((duty) => (
              <div key={duty.id} className="group flex items-center justify-between p-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-xs font-semibold text-slate-700">{duty.label}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingDuty(duty)} className="text-slate-400 hover:text-indigo-600 p-1 transition"><Edit2 size={12} /></button>
                  <button onClick={() => onRemoveDuty(duty.id)} className="text-slate-400 hover:text-red-600 p-1 transition"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM RESET */}
        <div className="pt-6 border-t border-slate-100">
           <button 
              onClick={onResetAll}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-colors border border-red-100"
            >
              <RotateCcw size={16} />
              Resetuj na prazno
            </button>
        </div>
      </div>
      
      {editingEmployee && (
        <EditEmployeeModal employee={editingEmployee} onClose={() => setEditingEmployee(null)} onUpdate={onUpdateEmployee} />
      )}

      {editingDuty && (
        <EditDutyModal duty={editingDuty} onClose={() => setEditingDuty(null)} onUpdate={onUpdateDuty} />
      )}

      {isAddingShift && (
        <AddShiftModal onClose={() => setIsAddingShift(false)} onAdd={onAddShift} />
      )}

      {editingShift && (
        <EditShiftModal shift={editingShift} onClose={() => setEditingShift(null)} onUpdate={onUpdateShift} />
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