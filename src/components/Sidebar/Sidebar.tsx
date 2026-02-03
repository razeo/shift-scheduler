import React, { useState } from 'react';
import { Users, Calendar, Tag, Settings, Download, Upload, RotateCcw, Plus, Trash2, X, FileText, Save, FolderOpen, ArrowLeftRight, AlertTriangle, Bed, Utensils } from 'lucide-react';
import { Employee, Shift, Duty, Role, DayOfWeek, ALL_DAYS, ShiftTemplate } from '../../types/index';
import { generateId } from '../../utils/id';
import { exportToCSV, exportToJSON } from '../../utils/storage';

export interface SidebarProps {
  employees: Employee[];
  duties: Duty[];
  shifts: Shift[];
  assignments?: any[];
  aiRules: string;
  currentPage?: string;
  onPageChange?: (page: string) => void;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onRemoveEmployee: (id: string) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onAddDuty: (duty: Omit<Duty, 'id'>) => void;
  onRemoveDuty: (id: string) => void;
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onRemoveShift: (id: string) => void;
  onUpdateAiRules: (rules: string) => void;
  onResetAll: () => void;
  onImportData: (data: any) => void;
  onClose: () => void;
}

type TabType = 'employees' | 'shifts' | 'duties' | 'templates' | 'ai' | 'settings';

export function Sidebar({
  employees,
  duties,
  shifts,
  assignments = [],
  aiRules,
  currentPage = 'schedule',
  onPageChange = () => {},
  onAddEmployee,
  onRemoveEmployee,
  onUpdateEmployee,
  onAddDuty,
  onRemoveDuty,
  onAddShift,
  onRemoveShift,
  onUpdateAiRules,
  onResetAll,
  onImportData,
  onClose,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('employees');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [newEmployee, setNewEmployee] = useState({ name: '', role: Role.SERVER, availability: [] as DayOfWeek[] });
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [newDuty, setNewDuty] = useState({ label: '' });
  const [newShift, setNewShift] = useState({ 
    day: DayOfWeek.MONDAY, 
    startTime: '08:00', 
    endTime: '16:00', 
    label: '' 
  });
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '' });
  const [applyShiftToAllDays, setApplyShiftToAllDays] = useState(false);

  // Load templates from localStorage
  const [templates, setTemplates] = useState<ShiftTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('shift_scheduler_templates');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveTemplates = (newTemplates: ShiftTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('shift_scheduler_templates', JSON.stringify(newTemplates));
  };

  const handleAddEmployee = () => {
    if (newEmployee.name.trim()) {
      onAddEmployee({ 
        name: newEmployee.name.trim(), 
        role: newEmployee.role,
        availability: newEmployee.availability 
      });
      setNewEmployee({ name: '', role: Role.SERVER, availability: [] });
      setIsAdding(false);
    }
  };

  const handleUpdateEmployee = () => {
    if (editEmployee && editEmployee.name.trim()) {
      onUpdateEmployee(editEmployee);
      setEditEmployee(null);
      setEditingId(null);
    }
  };

  const toggleAvailability = (day: DayOfWeek) => {
    setNewEmployee(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const toggleEditAvailability = (day: DayOfWeek, employee: Employee) => {
    const newAvailability = employee.availability?.includes(day)
      ? employee.availability.filter(d => d !== day)
      : [...(employee.availability || []), day];
    setEditEmployee({ ...employee, availability: newAvailability });
  };

  const handleSaveTemplate = () => {
    if (newTemplate.name.trim() && shifts.length > 0) {
      const template: ShiftTemplate = {
        id: generateId('tpl'),
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim(),
        shifts: [...shifts],
        createdAt: Date.now(),
      };
      saveTemplates([...templates, template]);
      setNewTemplate({ name: '', description: '' });
      setIsAdding(false);
    }
  };

  const handleLoadTemplate = (template: ShiftTemplate) => {
    if (window.confirm(`Učitati šablon "${template.name}"? Ovo će zamijeniti trenutne smjene.`)) {
      onImportData({ shifts: template.shifts });
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Obriši ovaj šablon?')) {
      saveTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleExportCSV = () => {
    if (assignments.length === 0) {
      alert('Nema dodjela za export');
      return;
    }
    
    const employeeMap = new Map(employees.map(e => [e.id, e.name]));
    const shiftMap = new Map(shifts.map(s => [s.id, s]));
    
    const csvData = assignments.map(a => {
      const shift = shiftMap.get(a.shiftId);
      return {
        'Radnik': employeeMap.get(a.employeeId) || '?',
        'Smjena': shift?.label || '?',
        'Dan': shift?.day || '?',
        'Vrijeme': shift ? `${shift.startTime}-${shift.endTime}` : '?',
      };
    });
    
    exportToCSV(csvData, `raspored-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportJSON = () => {
    exportToJSON({
      employees,
      shifts,
      duties,
      assignments,
      exportedAt: new Date().toISOString(),
    }, `shift-scheduler-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          onImportData(data);
        } catch {
          alert('Greška pri uvozu: nevažeći JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white w-full max-w-[280px] shrink-0">
      {/* Page Navigation - scrollable on mobile */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-thin flex-nowrap min-w-0">
        {[
          { id: 'schedule', icon: Calendar, label: 'Raspored' },
          { id: 'handover', icon: ArrowLeftRight, label: 'Primop.' },
          { id: 'outofstock', icon: AlertTriangle, label: '86' },
          { id: 'responsibility', icon: Users, label: 'Plan' },
          { id: 'roomservice', icon: Bed, label: 'Room' },
          { id: 'wastelist', icon: Trash2, label: 'Otpis' },
          { id: 'dailymenu', icon: Utensils, label: 'Meni' },
          { id: 'allergens', icon: AlertTriangle, label: 'Alerg.' },
          { id: 'settings', icon: Settings, label: 'Postavke' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onPageChange(id)}
            className={`flex-shrink-0 p-2 flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
              currentPage === id 
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 relative z-10 shrink-0">
        <div>
          <h2 className="text-base font-semibold text-slate-800">🍽️ RestoHub</h2>
          <p className="text-[10px] text-slate-500">Restaurant</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden">
          <X size={18} />
        </button>
      </div>

      {/* Tabs - Only show on schedule page */}
      {currentPage === 'schedule' && (
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-thin shrink-0">
          {[
            { id: 'employees', icon: Users, label: 'Radnici' },
            { id: 'shifts', icon: Calendar, label: 'Smjene' },
            { id: 'duties', icon: Tag, label: 'Dužnosti' },
            { id: 'templates', icon: FileText, label: 'Šabloni' },
            { id: 'ai', icon: Settings, label: 'AI' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex-shrink-0 p-2 flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
                activeTab === id 
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {/* EMPLOYEES TAB */}
        {currentPage === 'schedule' && activeTab === 'employees' && (
          <div className="p-4 space-y-3">
            {employees.map(employee => (
              <div 
                key={employee.id} 
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({
                    type: 'employee',
                    employeeId: employee.id,
                    employeeName: employee.name,
                    employeeRole: employee.role
                  }));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className="p-3 bg-slate-50 rounded-lg cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      employee.role === Role.CHEF ? 'bg-orange-100 text-orange-700' :
                      employee.role === Role.MANAGER ? 'bg-purple-100 text-purple-700' :
                      employee.role === Role.BARTENDER ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{employee.name}</p>
                      <p className="text-xs text-slate-500">{employee.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setEditEmployee(employee);
                        setEditingId(employee.id);
                      }}
                      className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg"
                    >
                      <Settings size={14} />
                    </button>
                    <button 
                      onClick={() => onRemoveEmployee(employee.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {employee.availability && employee.availability.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ALL_DAYS.map(day => (
                      <span 
                        key={day}
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          employee.availability!.includes(day)
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                )}
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
                <div>
                  <p className="text-sm text-slate-600 mb-2">Dostupnost:</p>
                  <div className="flex flex-wrap gap-1">
                    {ALL_DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleAvailability(day)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          newEmployee.availability.includes(day)
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
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
            
            {editingId && editEmployee && (
              <div className="p-4 bg-amber-50 rounded-lg space-y-3">
                <p className="font-medium text-amber-800">Uredi radnika:</p>
                <input
                  type="text"
                  value={editEmployee.name}
                  onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                  className="input"
                />
                <select
                  value={editEmployee.role}
                  onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value as Role })}
                  className="input"
                >
                  {Object.values(Role).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Dostupnost:</p>
                  <div className="flex flex-wrap gap-1">
                    {ALL_DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleEditAvailability(day, editEmployee)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          editEmployee.availability?.includes(day)
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpdateEmployee} className="btn btn-primary flex-1">
                    Sačuvaj
                  </button>
                  <button onClick={() => { setEditingId(null); setEditEmployee(null); }} className="btn btn-secondary">
                    Otkaži
                  </button>
                </div>
              </div>
            )}
            
            {!isAdding && !editingId && (
              <button onClick={() => setIsAdding(true)} className="w-full btn btn-primary flex items-center justify-center gap-2">
                <Plus size={18} /> Dodaj radnika
              </button>
            )}
          </div>
        )}

        {/* SHIFTS TAB */}
        {currentPage === 'schedule' && activeTab === 'shifts' && (
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
                
                {/* Apply to all days */}
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={applyShiftToAllDays}
                    onChange={(e) => setApplyShiftToAllDays(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Primeni na sve dane</span>
                </label>
                
                {!applyShiftToAllDays && (
                  <select
                    value={newShift.day}
                    onChange={(e) => setNewShift({ ...newShift, day: e.target.value as DayOfWeek })}
                    className="input"
                  >
                    {ALL_DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                )}
                
                {applyShiftToAllDays && (
                  <div className="flex flex-wrap gap-1">
                    {ALL_DAYS.map(day => (
                      <span key={day} className="text-xs px-2 py-1 bg-white rounded text-slate-600">
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (applyShiftToAllDays) {
                      // Create shift for each day
                      ALL_DAYS.forEach(day => {
                        onAddShift({ day, startTime: newShift.startTime, endTime: newShift.endTime, label: newShift.label });
                      });
                    } else {
                      onAddShift(newShift);
                    }
                    setNewShift({ day: DayOfWeek.MONDAY, startTime: '08:00', endTime: '16:00', label: '' });
                    setApplyShiftToAllDays(false);
                  }} className="btn btn-primary flex-1">
                    Dodaj
                  </button>
                  <button onClick={() => { setIsAdding(false); setNewShift({ day: DayOfWeek.MONDAY, startTime: '08:00', endTime: '16:00', label: '' }); setApplyShiftToAllDays(false); }} className="btn btn-secondary">
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

        {/* DUTIES TAB */}
        {currentPage === 'schedule' && activeTab === 'duties' && (
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
                  <button onClick={() => {
                    onAddDuty({ label: newDuty.label });
                    setNewDuty({ label: '' });
                    setIsAdding(false);
                  }} className="btn btn-primary flex-1">
                    Dodaj
                  </button>
                  <button onClick={() => { setIsAdding(false); setNewDuty({ label: '' }); }} className="btn btn-secondary">
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

        {/* TEMPLATES TAB */}
        {currentPage === 'schedule' && activeTab === 'templates' && (
          <div className="p-4 space-y-3">
            {templates.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Nema sačuvanih šablona</p>
            )}
            
            {templates.map(template => (
              <div key={template.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-800">{template.name}</p>
                  <button 
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {template.description && (
                  <p className="text-xs text-slate-500 mb-2">{template.description}</p>
                )}
                <p className="text-xs text-slate-400">{template.shifts.length} smjena</p>
                <button 
                  onClick={() => handleLoadTemplate(template)}
                  className="mt-2 w-full btn btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <FolderOpen size={14} /> Učitaj
                </button>
              </div>
            ))}
            
            {isAdding && (
              <div className="p-4 bg-primary-50 rounded-lg space-y-3">
                <input
                  type="text"
                  placeholder="Naziv šablona"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="input"
                />
                <textarea
                  placeholder="Opis (opcionalno)"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="input min-h-[60px] resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveTemplate} className="btn btn-primary flex-1">
                    <Save size={16} /> Sačuvaj
                  </button>
                  <button onClick={() => { setIsAdding(false); setNewTemplate({ name: '', description: '' }); }} className="btn btn-secondary">
                    Otkaži
                  </button>
                </div>
              </div>
            )}
            
            {!isAdding && (
              <button onClick={() => setIsAdding(true)} className="w-full btn btn-primary flex items-center justify-center gap-2">
                <Save size={18} /> Sačuvaj kao šablon
              </button>
            )}
          </div>
        )}

        {/* AI TAB */}
        {currentPage === 'schedule' && activeTab === 'ai' && (
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

        {/* SETTINGS TAB */}
        {currentPage === 'schedule' && activeTab === 'settings' && (
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-slate-800">Podaci</h3>
            
            <label className="btn btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={18} /> Uvoz podataka
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
            
            <button onClick={handleExportJSON} className="btn btn-secondary w-full flex items-center justify-center gap-2">
              <Download size={18} /> Izvoz JSON
            </button>
            
            <button onClick={handleExportCSV} className="btn btn-secondary w-full flex items-center justify-center gap-2">
              <FileText size={18} /> Izvoz CSV
            </button>
            
            <button onClick={onResetAll} className="btn btn-danger w-full flex items-center justify-center gap-2">
              <RotateCcw size={18} /> Resetuj sve
            </button>
          </div>
        )}

        {/* Placeholder for other pages */}
        {currentPage !== 'schedule' && (
          <div className="p-4 text-center text-slate-500">
            <p>Koristi navigaciju na vrhu za prebacivanje između modula</p>
          </div>
        )}
      </div>
    </div>
  );
}
