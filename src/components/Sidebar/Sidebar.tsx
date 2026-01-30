import React from 'react';
import { Users, Calendar, Tag, Settings, Download, Upload, RotateCcw, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Employee, Shift, Duty, Role, DayOfWeek } from '../../types';
import { generateEmployeeId, generateDutyId, generateShiftId } from '../../utils/id';

interface SidebarProps {
  employees: Employee[];
  duties: Duty[];
  shifts: Shift[];
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
  onResetAll: () => void;
  onImportData: (data: any) => void;
  onClose: () => void;
}

type TabType = 'employees' | 'shifts' | 'duties' | 'ai' | 'settings';

export function Sidebar({
  employees,
  duties,
  shifts,
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
  onClose,
}: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>('employees');
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Form states
  const [newEmployee, setNewEmployee] = React.useState({ name: '', role: Role.SERVER });
  const [newDuty, setNewDuty] = React.useState({ label: '' });
  const [newShift, setNewShift] = React.useState({ 
    day: DayOfWeek.MONDAY, 
    startTime: '08:00', 
    endTime: '16:00', 
    label: '' 
  });

  const handleAddEmployee = () => {
    if (newEmployee.name.trim()) {
      onAddEmployee({ name: newEmployee.name.trim(), role: newEmployee.role });
      setNewEmployee({ name: '', role: Role.SERVER });
      setIsAdding(false);
    }
  };

  const handleAddDuty = () => {
    if (newDuty.label.trim()) {
      onAddDuty({ label: newDuty.label.trim() });
      setNewDuty({ label: '' });
      setIsAdding(false);
    }
  };

  const handleAddShift = () => {
    if (newShift.label.trim()) {
      onAddShift({
        day: newShift.day,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        label: newShift.label.trim(),
      });
      setNewShift({ day: DayOfWeek.MONDAY, startTime: '08:00', endTime: '16:00', label: '' });
      setIsAdding(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          onImportData(data);
        } catch (error) {
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileExport = () => {
    const data = {
      employees,
      shifts,
      duties,
      aiRules,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-scheduler-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">🍽️ Shift Scheduler</h2>
          <p className="text-xs text-slate-500">Restoran menadžment</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'employees', icon: Users, label: 'Radnici' },
          { id: 'shifts', icon: Calendar, label: 'Smjene' },
          { id: 'duties', icon: Tag, label: 'Dužnosti' },
          { id: 'ai', icon: Settings, label: 'AI' },
          { id: 'settings', icon: Settings, label: 'Postavke' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabType)}
            className={`flex-1 p-3 flex flex-col items-center gap-1 text-xs transition-colors ${
              activeTab === id 
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'employees' && (
          <div className="p-4 space-y-3">
            {employees.map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{employee.name}</p>
                  <p className="text-xs text-slate-500">{employee.role}</p>
                </div>
                <button 
                  onClick={() => onRemoveEmployee(employee.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {isAdding && (
              <div className="p-4 bg-primary-50 rounded-lg space-y-3">
                <input
                  type="text"
                  placeholder="Ime radnika"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="input"
                />
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as Role })}
                  className="input"
                >
                  {Object.values(Role).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={handleAddEmployee} className="btn btn-primary flex-1">
                    Dodaj
                  </button>
                  <button onClick={() => setIsAdding(false)} className="btn btn-secondary">
                    Otkaži
                  </button>
                </div>
              </div>
            )}
            
            {!isAdding && (
              <button onClick={() => setIsAdding(true)} className="w-full btn btn-primary flex items-center justify-center gap-2">
                <Plus size={18} /> Dodaj radnika
              </button>
            )}
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="p-4 space-y-3">
            {shifts.map(shift => (
              <div key={shift.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{shift.label}</p>
                  <p className="text-xs text-slate-500">{shift.day} {shift.startTime}-{shift.endTime}</p>
                </div>
                <button 
                  onClick={() => onRemoveShift(shift.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {isAdding && (
              <div className="p-4 bg-primary-50 rounded-lg space-y-3">
                <input
                  type="text"
                  placeholder="Naziv smjene"
                  value={newShift.label}
                  onChange={(e) => setNewShift({ ...newShift, label: e.target.value })}
                  className="input"
                />
                <select
                  value={newShift.day}
                  onChange={(e) => setNewShift({ ...newShift, day: e.target.value as DayOfWeek })}
                  className="input"
                >
                  {Object.values(DayOfWeek).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    className="input"
                  />
                  <input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddShift} className="btn btn-primary flex-1">
                    Dodaj
                  </button>
                  <button onClick={() => setIsAdding(false)} className="btn btn-secondary">
                    Otkaži
                  </button>
                </div>
              </div>
            )}
            
            {!isAdding && (
              <button onClick={() => setIsAdding(true)} className="w-full btn btn-primary flex items-center justify-center gap-2">
                <Plus size={18} /> Dodaj smjenu
              </button>
            )}
          </div>
        )}

        {activeTab === 'duties' && (
          <div className="p-4 space-y-3">
            {duties.map(duty => (
              <div key={duty.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-800">{duty.label}</p>
                <button 
                  onClick={() => onRemoveDuty(duty.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {isAdding && (
              <div className="p-4 bg-primary-50 rounded-lg space-y-3">
                <input
                  type="text"
                  placeholder="Naziv dužnosti"
                  value={newDuty.label}
                  onChange={(e) => setNewDuty({ ...newDuty, label: e.target.value })}
                  className="input"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddDuty} className="btn btn-primary flex-1">
                    Dodaj
                  </button>
                  <button onClick={() => setIsAdding(false)} className="btn btn-secondary">
                    Otkaži
                  </button>
                </div>
              </div>
            )}
            
            {!isAdding && (
              <button onClick={() => setIsAdding(true)} className="w-full btn btn-primary flex items-center justify-center gap-2">
                <Plus size={18} /> Dodaj dužnost
              </button>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="p-4">
            <h3 className="font-medium text-slate-800 mb-3">Pravila za AI</h3>
            <textarea
              value={aiRules}
              onChange={(e) => onUpdateAiRules(e.target.value)}
              className="input min-h-[200px] resize-none"
              placeholder="Unesite pravila za AI raspored..."
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-slate-800">Podaci</h3>
            
            <label className="btn btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={18} /> Uvoz podataka
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
            
            <button onClick={handleFileExport} className="btn btn-secondary w-full flex items-center justify-center gap-2">
              <Download size={18} /> Izvoz podataka
            </button>
            
            <button onClick={onResetAll} className="btn btn-danger w-full flex items-center justify-center gap-2">
              <RotateCcw size={18} /> Resetuj sve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
