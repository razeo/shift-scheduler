import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ScheduleGrid from './components/ScheduleGrid';
import ChatInterface from './components/ChatInterface';
import { Employee, Shift, Assignment, ChatMessage, ScheduleState, Role, Duty } from './types';
import { INITIAL_EMPLOYEES, INITIAL_SHIFTS, INITIAL_DUTIES, DEFAULT_AI_RULES } from './constants';
import { processScheduleRequest } from './services/gemini';
import { Menu, X, Bot } from 'lucide-react';

// STABILNI KLJUČEVI - ne mijenjati ih nikada kako bi se očuvali korisnički podaci
const STORAGE_KEYS = {
  EMPLOYEES: 'shiftmaster_permanent_employees',
  DUTIES: 'shiftmaster_permanent_duties',
  SHIFTS: 'shiftmaster_permanent_shifts',
  ASSIGNMENTS: 'shiftmaster_permanent_assignments',
  AI_RULES: 'shiftmaster_permanent_ai_rules',
};

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const formatDateToId = (date: Date) => {
  return date.toISOString().split('T')[0];
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
  const updateAssignment = (id: string, duty: string) => setAssignments(prev => prev.map(a => a.id === id ? { ...a, specialDuty: duty } : a));
  const manualAssign = (shiftId: string, employeeId: string) => {
    if (assignments.some(a => a.shiftId === shiftId && a.employeeId === employeeId && a.weekId === currentWeekId)) return;
    setAssignments(prev => [...prev, { id: `asg-${Date.now()}`, shiftId, employeeId, weekId: currentWeekId }]);
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
      <button className="lg:hidden absolute top-6 left-6 z-[60] p-3 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar employees={employees} duties={duties} aiRules={aiRules} onAddEmployee={addEmployee} onRemoveEmployee={removeEmployee} onUpdateEmployee={updateEmployee} onAddDuty={addDuty} onRemoveDuty={removeDuty} onUpdateDuty={updateDuty} onUpdateAiRules={setAiRules} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <ScheduleGrid shifts={shifts} assignments={weekAssignments} employees={employees} duties={duties} currentWeekStart={currentWeekStart} onRemoveAssignment={removeAssignment} onAddShift={addShift} onRemoveShift={removeShift} onUpdateShift={updateShift} onManualAssign={manualAssign} onUpdateAssignment={updateAssignment} onNavigateWeek={navigateWeek} />
        <button className="lg:hidden fixed bottom-6 right-6 z-50 p-5 bg-indigo-600 text-white rounded-2xl shadow-2xl transition-transform active:scale-95" onClick={() => setIsChatOpen(!isChatOpen)}>
          {isChatOpen ? <X size={24} /> : <Bot size={24} />}
        </button>
      </div>
      <div className={`fixed lg:static inset-y-0 right-0 z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <ChatInterface messages={chatMessages} onSendMessage={handleAiMessage} onCancelAi={() => abortControllerRef.current?.abort()} onApplyChanges={applyProposedChanges} onDiscardChanges={(mid) => setChatMessages(prev => prev.map(m => m.id === mid ? { ...m, status: 'discarded', text: "Prijedlog je odbačen." } : m))} isLoading={isAiLoading} />
      </div>
      {(isSidebarOpen || isChatOpen) && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => { setIsSidebarOpen(false); setIsChatOpen(false); }} />}
    </div>
  );
};

export default App;
