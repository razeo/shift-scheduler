// ===========================================
// Main App Component
// Shift Scheduler - Restaurant Shift Management
// ===========================================

import { useState, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { useLocalStorage, clearAllData } from './hooks/useLocalStorage';
import { generateEmployeeId, generateDutyId, generateShiftId, generateAssignmentId } from './utils/id';
import { getMonday, formatDateToId, addWeeks } from './utils/date';
import { 
  Employee, 
  Shift, 
  Assignment, 
  Duty, 
  ChatMessage, 
  Role, 
  DayOfWeek 
} from './types';
import { Sidebar } from './components/Sidebar';
import { ScheduleGrid } from './components/Schedule';
import { ChatInterface } from './components/Chat';

const STORAGE_KEYS = {
  EMPLOYEES: 'shift_scheduler_employees',
  DUTIES: 'shift_scheduler_duties',
  SHIFTS: 'shift_scheduler_shifts',
  ASSIGNMENTS: 'shift_scheduler_assignments',
  AI_RULES: 'shift_scheduler_ai_rules',
};

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Marko Marković', role: Role.SERVER },
  { id: 'emp-2', name: 'Jovan Jovanović', role: Role.CHEF },
  { id: 'emp-3', name: 'Petar Petrović', role: Role.BARTENDER },
];

const INITIAL_DUTIES: Duty[] = [
  { id: 'dt-1', label: 'Glavna smjena' },
  { id: 'dt-2', label: 'Pomoćna smjena' },
  { id: 'dt-3', label: 'Vikend' },
];

const INITIAL_SHIFTS: Shift[] = [
  { id: 'sh-1', day: DayOfWeek.MONDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-2', day: DayOfWeek.MONDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-3', day: DayOfWeek.TUESDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-4', day: DayOfWeek.TUESDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-5', day: DayOfWeek.WEDNESDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-6', day: DayOfWeek.WEDNESDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-7', day: DayOfWeek.THURSDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-8', day: DayOfWeek.THURSDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-9', day: DayOfWeek.FRIDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-10', day: DayOfWeek.FRIDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-11', day: DayOfWeek.SATURDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-12', day: DayOfWeek.SATURDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-13', day: DayOfWeek.SUNDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-14', day: DayOfWeek.SUNDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
];

const DEFAULT_AI_RULES = `• Svaki radnik ima max 5 smjena sedmično
• Poštuj dostupnost radnika
• Barbier i Host ne mogu raditi noćne smjene
• Vikendi su za iskusne radnike`;

function App() {
  // State management with localStorage persistence
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_EMPLOYEES;
  });
  
  const [duties, setDuties] = useState<Duty[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.DUTIES);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_DUTIES;
  });
  
  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SHIFTS;
  });
  
  const [assignments, setAssignmentsState] = useState<Assignment[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  
  const [aiRules, setAiRules] = useState<string>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.AI_RULES);
      if (item) return item;
    } catch {}
    return DEFAULT_AI_RULES;
  });

  // UI State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Computed values
  const currentWeekId = useMemo(() => formatDateToId(currentWeekStart), [currentWeekStart]);
  
  const weekAssignments = useMemo(() => {
    const filtered = assignments.filter(a => a.weekId === currentWeekId);
    console.log('[DEBUG] weekAssignments:', {
      total: assignments.length,
      weekId: currentWeekId,
      filtered: filtered.length
    });
    return filtered;
  }, [assignments, currentWeekId]);

  // CRUD Operations - Employees
  const addEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const updated = [...employees, { ...newEmp, id: generateEmployeeId() }];
    setEmployees(updated);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
    toast.success(`Dodat radnik: ${newEmp.name}`);
  };
  
  const removeEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
    
    const filteredAssignments = assignments.filter(a => a.employeeId !== id);
    setAssignmentsState(filteredAssignments);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(filteredAssignments));
    
    if (employee) toast.success(`Uklonjen radnik: ${employee.name}`);
  };

  // CRUD Operations - Duties
  const addDuty = (newDuty: Omit<Duty, 'id'>) => {
    const updated = [...duties, { ...newDuty, id: generateDutyId() }];
    setDuties(updated);
    localStorage.setItem(STORAGE_KEYS.DUTIES, JSON.stringify(updated));
    toast.success(`Dodata dužnost: ${newDuty.label}`);
  };
  
  const removeDuty = (id: string) => {
    const duty = duties.find(d => d.id === id);
    const updated = duties.filter(d => d.id !== id);
    setDuties(updated);
    localStorage.setItem(STORAGE_KEYS.DUTIES, JSON.stringify(updated));
    if (duty) toast.success(`Uklonjena dužnost: ${duty.label}`);
  };

  // CRUD Operations - Shifts
  const addShift = (newShift: Omit<Shift, 'id'>) => {
    const updated = [...shifts, { ...newShift, id: generateShiftId() }];
    setShifts(updated);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(updated));
    toast.success(`Dodata smjena: ${newShift.label}`);
  };
  
  const removeShift = (id: string) => {
    const shift = shifts.find(s => s.id === id);
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(updated));
    
    const filteredAssignments = assignments.filter(a => a.shiftId !== id);
    setAssignmentsState(filteredAssignments);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(filteredAssignments));
    
    if (shift) toast.success(`Uklonjena smjena: ${shift.label}`);
  };

  // Assignment Operations
  const removeAssignment = (id: string) => {
    const filtered = assignments.filter(a => a.id !== id);
    setAssignmentsState(filtered);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(filtered));
  };

  const manualAssign = (shiftId: string, employeeId: string) => {
    console.log('[DEBUG] manualAssign:', { shiftId, employeeId, currentWeekId });
    
    if (assignments.some(a => 
      a.shiftId === shiftId && 
      a.employeeId === employeeId && 
      a.weekId === currentWeekId
    )) {
      toast.error('Radnik je već dodijeljen ovoj smjeni');
      return;
    }
    
    const newAssignment: Assignment = { 
      id: generateAssignmentId(), 
      shiftId, 
      employeeId, 
      weekId: currentWeekId 
    };
    
    const updated = [...assignments, newAssignment];
    setAssignmentsState(updated);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
    
    const employee = employees.find(e => e.id === employeeId);
    toast.success(`Dodijeljen: ${employee?.name || '?'}`);
  };

  // Navigation
  const navigateWeek = (direction: number) => 
    setCurrentWeekStart(addWeeks(currentWeekStart, direction));

  // AI Chat (placeholder - to be implemented)
  const handleAiMessage = async (text: string) => {
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text, 
      timestamp: Date.now() 
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    // Placeholder AI response
    setTimeout(() => {
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'AI funkcionalnost će uskoro biti implementirana. Za sada možete ručno kreirati raspored koristeći dugmad za dodavanje radnika i smjena.',
        timestamp: Date.now(),
        status: 'pending'
      };
      setChatMessages(prev => [...prev, modelMsg]);
      setIsAiLoading(false);
    }, 1000);
  };

  const handleApplyChanges = (messageId: string) => {
    setChatMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'applied' } : m
    ));
    toast.success('Izmjene primijenjene');
  };

  const handleDiscardChanges = (messageId: string) => {
    setChatMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'discarded' } : m
    ));
    toast.success('Izmjene odbacene');
  };

  const handleCancelAi = () => {
    setIsAiLoading(false);
    toast.success('AI prekinut');
  };

  // Import/Export
  const handleImportData = (data: any) => {
    try {
      if (data.employees) {
        setEmployees(data.employees);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(data.employees));
      }
      if (data.shifts) {
        setShifts(data.shifts);
        localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(data.shifts));
      }
      if (data.duties) {
        setDuties(data.duties);
        localStorage.setItem(STORAGE_KEYS.DUTIES, JSON.stringify(data.duties));
      }
      if (data.aiRules !== undefined) {
        setAiRules(data.aiRules);
        localStorage.setItem(STORAGE_KEYS.AI_RULES, data.aiRules);
      }
      if (data.assignments) {
        setAssignmentsState(data.assignments);
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(data.assignments));
      }
      toast.success('Podaci uvezeni!');
    } catch (e) {
      toast.error('Greška pri uvozu podataka');
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Da li ste sigurni da želite resetovati sve podatke?')) {
      clearAllData();
      setEmployees(INITIAL_EMPLOYEES);
      setShifts(INITIAL_SHIFTS);
      setDuties(INITIAL_DUTIES);
      setAiRules(DEFAULT_AI_RULES);
      setAssignmentsState([]);
      setChatMessages([]);
      toast.success('Svi podaci su resetovani');
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out bg-white ${
          isSidebarOpen 
            ? 'translate-x-0 lg:w-80 border-r border-slate-200' 
            : '-translate-x-full lg:w-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        <Sidebar 
          employees={employees} 
          duties={duties} 
          shifts={shifts}
          aiRules={aiRules} 
          onAddEmployee={addEmployee} 
          onRemoveEmployee={removeEmployee} 
          onAddDuty={addDuty} 
          onRemoveDuty={removeDuty} 
          onAddShift={addShift}
          onRemoveShift={removeShift}
          onUpdateAiRules={(rules: string) => {
            setAiRules(rules);
            localStorage.setItem(STORAGE_KEYS.AI_RULES, rules);
          }} 
          onResetAll={handleResetAll}
          onImportData={handleImportData}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <ScheduleGrid 
          shifts={shifts} 
          assignments={weekAssignments} 
          employees={employees} 
          duties={duties} 
          currentWeekStart={currentWeekStart} 
          onRemoveAssignment={removeAssignment} 
          onManualAssign={manualAssign} 
          onNavigateWeek={navigateWeek} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
        />
        
        {/* Mobile FABs */}
        {!isSidebarOpen && (
           <button 
            className="lg:hidden absolute top-6 left-6 z-[60] p-3 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100"
            onClick={() => setIsSidebarOpen(true)}
           >
            <Menu size={20} />
           </button>
        )}
      </div>

      {/* Chat Interface */}
      <div 
        className={`fixed lg:static inset-y-0 right-0 z-50 transition-all duration-300 ease-in-out bg-white ${
          isChatOpen 
            ? 'translate-x-0 lg:w-96 border-l border-slate-200 shadow-xl lg:shadow-none' 
            : 'translate-x-full lg:w-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        <ChatInterface 
          messages={chatMessages} 
          onSendMessage={handleAiMessage} 
          onCancelAi={handleCancelAi} 
          onApplyChanges={handleApplyChanges} 
          onDiscardChanges={handleDiscardChanges} 
          isLoading={isAiLoading} 
          onClose={() => setIsChatOpen(false)}
        />
      </div>

      {/* Mobile Overlay */}
      {(isSidebarOpen || isChatOpen) && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => { setIsSidebarOpen(false); setIsChatOpen(false); }}
        />
      )}
    </div>
  );
}

export default App;
