// ===========================================
// Main App Component
// Shift Scheduler - Restaurant Management System
// ===========================================

import { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Menu, Settings } from 'lucide-react';
import { STORAGE_KEYS, runMigrations, getStorageItem, setStorageItem, clearAllStorage } from './utils/storage';
import { generateEmployeeId, generateDutyId, generateShiftId, generateAssignmentId } from './utils/id';
import { getMonday, formatDateToId, addWeeks } from './utils/date';
import { 
  Employee, 
  Shift, 
  Assignment, 
  Duty, 
  ChatMessage, 
  Role, 
  DayOfWeek,
  ScheduleState 
} from './types';
import { Sidebar } from './components/Sidebar';
import { ScheduleGrid } from './components/Schedule';
import { ChatInterface } from './components/Chat';
import { ShiftHandover } from './components/ShiftHandover';
import { processScheduleRequest, isAiConfigured } from './services/ai';

type PageType = 'schedule' | 'handover' | 'settings';

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
  // Run migrations on app start
  useEffect(() => {
    runMigrations();
  }, []);

  // Page state
  const [currentPage, setCurrentPage] = useState<PageType>('schedule');

  // State management with localStorage persistence
  const [employees, setEmployees] = useState<Employee[]>(() => 
    getStorageItem(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES)
  );
  
  const [duties, setDuties] = useState<Duty[]>(() => 
    getStorageItem(STORAGE_KEYS.DUTIES, INITIAL_DUTIES)
  );
  
  const [shifts, setShifts] = useState<Shift[]>(() => 
    getStorageItem(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS)
  );
  
  const [assignments, setAssignments] = useState<Assignment[]>(() => 
    getStorageItem(STORAGE_KEYS.ASSIGNMENTS, [])
  );
  
  const [aiRules, setAiRules] = useState<string>(() => 
    getStorageItem(STORAGE_KEYS.AI_RULES, DEFAULT_AI_RULES)
  );

  // UI State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Computed values
  const currentWeekId = useMemo(() => formatDateToId(currentWeekStart), [currentWeekStart]);
  
  const weekAssignments = useMemo(() => 
    assignments.filter(a => a.weekId === currentWeekId),
    [assignments, currentWeekId]
  );

  // CRUD Operations - Employees
  const addEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const updated = [...employees, { ...newEmp, id: generateEmployeeId() }];
    setEmployees(updated);
    setStorageItem(STORAGE_KEYS.EMPLOYEES, updated);
    toast.success(`Dodat radnik: ${newEmp.name}`);
  };
  
  const removeEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    setStorageItem(STORAGE_KEYS.EMPLOYEES, updated);
    
    const filteredAssignments = assignments.filter(a => a.employeeId !== id);
    setAssignments(filteredAssignments);
    setStorageItem(STORAGE_KEYS.ASSIGNMENTS, filteredAssignments);
    
    if (employee) toast.success(`Uklonjen radnik: ${employee.name}`);
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    const updated = employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
    setEmployees(updated);
    setStorageItem(STORAGE_KEYS.EMPLOYEES, updated);
    toast.success('Radnik ažuriran');
  };

  // CRUD Operations - Duties
  const addDuty = (newDuty: Omit<Duty, 'id'>) => {
    const updated = [...duties, { ...newDuty, id: generateDutyId() }];
    setDuties(updated);
    setStorageItem(STORAGE_KEYS.DUTIES, updated);
    toast.success(`Dodata dužnost: ${newDuty.label}`);
  };
  
  const removeDuty = (id: string) => {
    const duty = duties.find(d => d.id === id);
    const updated = duties.filter(d => d.id !== id);
    setDuties(updated);
    setStorageItem(STORAGE_KEYS.DUTIES, updated);
    if (duty) toast.success(`Uklonjena dužnost: ${duty.label}`);
  };

  // CRUD Operations - Shifts
  const addShift = (newShift: Omit<Shift, 'id'>) => {
    const updated = [...shifts, { ...newShift, id: generateShiftId() }];
    setShifts(updated);
    setStorageItem(STORAGE_KEYS.SHIFTS, updated);
    toast.success(`Dodata smjena: ${newShift.label}`);
  };
  
  const removeShift = (id: string) => {
    const shift = shifts.find(s => s.id === id);
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    setStorageItem(STORAGE_KEYS.SHIFTS, updated);
    
    const filteredAssignments = assignments.filter(a => a.shiftId !== id);
    setAssignments(filteredAssignments);
    setStorageItem(STORAGE_KEYS.ASSIGNMENTS, filteredAssignments);
    
    if (shift) toast.success(`Uklonjena smjena: ${shift.label}`);
  };

  // Assignment Operations
  const removeAssignment = (id: string) => {
    const filtered = assignments.filter(a => a.id !== id);
    setAssignments(filtered);
    setStorageItem(STORAGE_KEYS.ASSIGNMENTS, filtered);
  };

  const manualAssign = (shiftId: string, employeeId: string) => {
    const isDuplicate = assignments.some(a => 
      a.shiftId === shiftId && 
      a.employeeId === employeeId && 
      a.weekId === currentWeekId
    );
    
    if (isDuplicate) {
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
    setAssignments(updated);
    setStorageItem(STORAGE_KEYS.ASSIGNMENTS, updated);
    
    const employee = employees.find(e => e.id === employeeId);
    toast.success(`Dodijeljen: ${employee?.name || '?'}`);
  };

  // Navigation
  const navigateWeek = (direction: number) => 
    setCurrentWeekStart(addWeeks(currentWeekStart, direction));

  // AI Chat
  const handleAiMessage = async (text: string) => {
    if (!isAiConfigured()) {
      toast.error('API ključ nije podešen. Dodajte VITE_GROQ_API_KEY u .env.local');
      return;
    }

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text, 
      timestamp: Date.now() 
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);
    setAiError(null);

    try {
      const state: ScheduleState = {
        employees,
        shifts,
        assignments,
        duties,
        currentWeekId,
        aiRules,
      };

      const response = await processScheduleRequest(text, state);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.message,
        timestamp: Date.now(),
        status: 'pending',
        pendingAssignments: response.assignments,
        pendingEmployees: response.newEmployees,
      };
      setChatMessages(prev => [...prev, modelMsg]);
      toast.success('AI je generisao prijedlog');
    } catch (error: any) {
      setAiError(error.message || 'Greška');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyChanges = (messageId: string) => {
    const message = chatMessages.find(m => m.id === messageId);
    if (!message?.pendingAssignments) return;

    const newAssignments: Assignment[] = message.pendingAssignments.map(a => ({
      ...a,
      id: generateAssignmentId(),
      weekId: currentWeekId,
    }));

    const updated = [...assignments, ...newAssignments];
    setAssignments(updated);
    setStorageItem(STORAGE_KEYS.ASSIGNMENTS, updated);

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

  // Import/Export
  const handleImportData = (data: any) => {
    try {
      if (data.employees) {
        setEmployees(data.employees);
        setStorageItem(STORAGE_KEYS.EMPLOYEES, data.employees);
      }
      if (data.shifts) {
        setShifts(data.shifts);
        setStorageItem(STORAGE_KEYS.SHIFTS, data.shifts);
      }
      if (data.duties) {
        setDuties(data.duties);
        setStorageItem(STORAGE_KEYS.DUTIES, data.duties);
      }
      if (data.aiRules !== undefined) {
        setAiRules(data.aiRules);
        setStorageItem(STORAGE_KEYS.AI_RULES, data.aiRules);
      }
      if (data.assignments) {
        setAssignments(data.assignments);
        setStorageItem(STORAGE_KEYS.ASSIGNMENTS, data.assignments);
      }
      toast.success('Podaci uvezeni!');
    } catch (e) {
      toast.error('Greška pri uvozu podataka');
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Da li ste sigurni da želite resetovati sve podatke?')) {
      clearAllStorage();
      setEmployees(INITIAL_EMPLOYEES);
      setShifts(INITIAL_SHIFTS);
      setDuties(INITIAL_DUTIES);
      setAiRules(DEFAULT_AI_RULES);
      setAssignments([]);
      setChatMessages([]);
      toast.success('Svi podaci su resetovani');
    }
  };

  // Page navigation handler for Sidebar
  const handlePageChange = (page: string) => {
    setCurrentPage(page as PageType);
    setIsSidebarOpen(false);
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
          assignments={assignments}
          aiRules={aiRules} 
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onAddEmployee={addEmployee} 
          onRemoveEmployee={removeEmployee} 
          onUpdateEmployee={updateEmployee}
          onAddDuty={addDuty} 
          onRemoveDuty={removeDuty} 
          onAddShift={addShift}
          onRemoveShift={removeShift}
          onUpdateAiRules={(rules: string) => {
            setAiRules(rules);
            setStorageItem(STORAGE_KEYS.AI_RULES, rules);
          }} 
          onResetAll={handleResetAll}
          onImportData={handleImportData}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {currentPage === 'schedule' && (
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
        )}

        {currentPage === 'handover' && (
          <ShiftHandover />
        )}

        {currentPage === 'settings' && (
          <div className="flex-1 flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <Settings size={64} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-700">Postavke</h2>
              <p className="text-slate-500">Dodatne postavke uskoro</p>
            </div>
          </div>
        )}
        
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
          onCancelAi={() => setIsAiLoading(false)}
          onApplyChanges={handleApplyChanges} 
          onDiscardChanges={handleDiscardChanges} 
          isLoading={isAiLoading} 
          onClose={() => setIsChatOpen(false)}
          error={aiError}
          onClearError={() => setAiError(null)}
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
