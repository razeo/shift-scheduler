import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ScheduleGrid from './components/ScheduleGrid';
import ChatInterface from './components/ChatInterface';
import { Employee, Shift, Assignment, ChatMessage, ScheduleState, Role, Duty } from './types';
import { INITIAL_EMPLOYEES, INITIAL_SHIFTS, INITIAL_DUTIES, DEFAULT_AI_RULES } from './constants';
import { processScheduleRequest } from './services/gemini';
import { Menu, X, Bot } from 'lucide-react';

const STORAGE_KEYS = {
  EMPLOYEES: 'shiftmaster_permanent_employees',
  DUTIES: 'shiftmaster_permanent_duties',
  SHIFTS: 'shiftmaster_permanent_shifts',
  ASSIGNMENTS: 'shiftmaster_permanent_assignments',
  AI_RULES: 'shiftmaster_permanent_ai_rules',
};

const getMonday = (d: Date) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const formatDateToId = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });
  
  const [duties, setDuties] = useState<Duty[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DUTIES);
    return saved ? JSON.parse(saved) : INITIAL_DUTIES;
  });
  
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });
  
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [aiRules, setAiRules] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AI_RULES);
    return saved !== null ? saved : DEFAULT_AI_RULES;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const currentWeekId = useMemo(() => formatDateToId(currentWeekStart), [currentWeekStart]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // State for panels - default open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initial responsive check
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
      setIsChatOpen(false);
    }
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DUTIES, JSON.stringify(duties)); }, [duties]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts)); }, [shifts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AI_RULES, aiRules); }, [aiRules]);

  const weekAssignments = useMemo(() => assignments.filter(a => a.weekId === currentWeekId), [assignments, currentWeekId]);

  const addEmployee = (newEmp: Omit<Employee, 'id'>) => setEmployees(prev => [...prev, { ...newEmp, id: `emp-${Date.now()}` }]);
  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setAssignments(prev => prev.filter(a => a.employeeId !== id));
  };
  const updateEmployee = (updated: Employee) => setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));

  const addDuty = (newDuty: Omit<Duty, 'id'>) => setDuties(prev => [...prev, { ...newDuty, id: `dt-${Date.now()}` }]);
  const removeDuty = (id: string) => setDuties(prev => prev.filter(d => d.id !== id));
  const updateDuty = (updated: Duty) => setDuties(prev => prev.map(d => d.id === updated.id ? updated : d));

  const addShift = (newShift: Omit<Shift, 'id'>) => setShifts(prev => [...prev, { ...newShift, id: `sh-${Date.now()}` }]);
  const removeShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    setAssignments(prev => prev.filter(a => a.shiftId !== id));
  };
  const updateShift = (updated: Shift) => setShifts(prev => prev.map(s => s.id === updated.id ? updated : s));

  const removeAssignment = (id: string) => setAssignments(prev => prev.filter(a => a.id !== id));
  const updateAssignment = (id: string, duty: string) => setAssignments(prev => prev.map(a => id === a.id ? { ...a, specialDuty: duty } : a));
  const manualAssign = (shiftId: string, employeeId: string) => {
    if (assignments.some(a => a.shiftId === shiftId && a.employeeId === employeeId && a.weekId === currentWeekId)) return;
    setAssignments(prev => [...prev, { id: `asg-${Date.now()}`, shiftId, employeeId, weekId: currentWeekId }]);
  };

  const handleImportData = (data: any) => {
    try {
      if (data.employees) setEmployees(data.employees);
      if (data.shifts) setShifts(data.shifts);
      if (data.duties) setDuties(data.duties);
      if (data.aiRules !== undefined) setAiRules(data.aiRules);
      if (data.assignments) setAssignments(data.assignments);
      alert("Podaci su uspješno učitani!");
    } catch (e) {
      alert("Greška pri učitavanju fajla.");
    }
  };

  const resetToDefaults = () => {
    if (window.confirm("Ovo će obrisati SVE vaše unose i vratiti praznu aplikaciju. Da li ste sigurni?")) {
      localStorage.clear();
      setEmployees(INITIAL_EMPLOYEES);
      setShifts(INITIAL_SHIFTS);
      setDuties(INITIAL_DUTIES);
      setAiRules(DEFAULT_AI_RULES);
      setAssignments([]);
      setChatMessages([]);
      window.location.reload();
    }
  };

  const navigateWeek = (direction: number) => {
    const nextDate = new Date(currentWeekStart);
    nextDate.setDate(nextDate.getDate() + direction * 7);
    setCurrentWeekStart(nextDate);
  };

  const handleAiMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);
    abortControllerRef.current = new AbortController();
    try {
      const result = await processScheduleRequest(text, { employees, duties, shifts, assignments: weekAssignments, currentWeekId, aiRules }, abortControllerRef.current.signal);
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.message + "\n\nDa li želite da primijenite ove izmjene u raspored?",
        timestamp: Date.now(),
        pendingAssignments: result.assignments,
        pendingEmployees: result.newEmployees,
        status: 'pending'
      }]);
    } catch (e: any) {
      if (e.message !== "AbortError") {
        setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "Došlo je do greške u komunikaciji sa AI asistentom.", timestamp: Date.now() }]);
      }
    } finally {
      setIsAiLoading(false);
      abortControllerRef.current = null;
    }
  };

  const applyProposedChanges = (messageId: string) => {
    const msg = chatMessages.find(m => m.id === messageId);
    if (!msg || !msg.pendingAssignments) return;
    if (msg.pendingEmployees && msg.pendingEmployees.length > 0) {
      const added: Employee[] = msg.pendingEmployees
        .filter(ne => !employees.some(e => e.name.toLowerCase() === ne.name.toLowerCase()))
        .map(ne => ({ id: `emp-ai-${Math.random().toString(36).substr(2, 5)}`, name: ne.name, role: ne.role as Role || Role.SERVER }));
      if (added.length > 0) setEmployees(prev => [...prev, ...added]);
    }
    const otherWeeksAssignments = assignments.filter(a => a.weekId !== currentWeekId);
    const currentWeekOldAssignments = assignments.filter(a => a.weekId === currentWeekId);
    const newWeekAssignments: Assignment[] = msg.pendingAssignments.map((a, i) => {
      const existing = currentWeekOldAssignments.find(old => old.shiftId === a.shiftId && old.employeeId === a.employeeId);
      return { id: existing?.id || `asg-ai-${Date.now()}-${i}`, shiftId: a.shiftId, employeeId: a.employeeId, specialDuty: a.specialDuty || existing?.specialDuty, weekId: currentWeekId };
    });
    setAssignments([...otherWeeksAssignments, ...newWeekAssignments]);
    setChatMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'applied' } : m));
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans selection:bg-indigo-100">
      
      {/* Sidebar Wrapper */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out transform bg-white ${
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
          onAddEmployee={addEmployee} 
          onRemoveEmployee={removeEmployee} 
          onUpdateEmployee={updateEmployee} 
          onAddDuty={addDuty} 
          onRemoveDuty={removeDuty} 
          onUpdateDuty={updateDuty} 
          onAddShift={addShift}
          onRemoveShift={removeShift}
          onUpdateShift={updateShift}
          onUpdateAiRules={setAiRules} 
          onResetAll={resetToDefaults}
          onImportData={handleImportData}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <ScheduleGrid 
          shifts={shifts} 
          assignments={weekAssignments} 
          employees={employees} 
          duties={duties} 
          currentWeekStart={currentWeekStart} 
          onRemoveAssignment={removeAssignment} 
          onManualAssign={manualAssign} 
          onUpdateAssignment={updateAssignment} 
          onNavigateWeek={navigateWeek} 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isChatOpen={isChatOpen}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
        />
        
        {/* Mobile FABs */}
        {!isSidebarOpen && (
           <button className="lg:hidden absolute top-6 left-6 z-[60] p-3 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
           </button>
        )}
        {!isChatOpen && (
          <button className="lg:hidden fixed bottom-6 right-6 z-50 p-5 bg-indigo-600 text-white rounded-2xl shadow-2xl transition-transform active:scale-95" onClick={() => setIsChatOpen(true)}>
            <Bot size={24} />
          </button>
        )}
      </div>

      {/* Chat Interface Wrapper */}
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
          onCancelAi={() => abortControllerRef.current?.abort()} 
          onApplyChanges={applyProposedChanges} 
          onDiscardChanges={(mid) => setChatMessages(prev => prev.map(m => m.id === mid ? { ...m, status: 'discarded', text: "Prijedlog je odbačen." } : m))} 
          isLoading={isAiLoading} 
          onClose={() => setIsChatOpen(false)}
        />
      </div>

      {/* Mobile Overlay */}
      {(isSidebarOpen || isChatOpen) && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => { setIsSidebarOpen(false); setIsChatOpen(false); }} />}
    </div>
  );
};

export default App;