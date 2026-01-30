// ===========================================
// Main App Component
// Shift Scheduler - Restaurant Shift Management
// ===========================================

import React, { useState, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useLocalStorage } from './hooks/useLocalStorage';
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

// Placeholder imports - will be implemented
// import Sidebar from './components/Layout/Sidebar';
// import ScheduleGrid from './components/Schedule/ScheduleGrid';
// import ChatInterface from './components/Chat/ChatInterface';

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
];

const DEFAULT_AI_RULES = `• Svaki radnik ima max 5 smjena sedmično
• Poštuj dostupnost radnika
• Barbier i Host ne mogu raditi noćne smjene
• Vikendi su za iskusne radnike`;

function App() {
  // State management with localStorage persistence
  const [employees, setEmployees] = useLocalStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  const [duties, setDuties] = useLocalStorage<Duty[]>(STORAGE_KEYS.DUTIES, INITIAL_DUTIES);
  const [shifts, setShifts] = useLocalStorage<Shift[]>(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  const [aiRules, setAiRules] = useLocalStorage<string>(STORAGE_KEYS.AI_RULES, DEFAULT_AI_RULES);

  // UI State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Computed values
  const currentWeekId = useMemo(() => formatDateToId(currentWeekStart), [currentWeekStart]);
  const weekAssignments = useMemo(() => 
    assignments.filter(a => a.weekId === currentWeekId), 
    [assignments, currentWeekId]
  );

  // CRUD Operations
  const addEmployee = (newEmp: Omit<Employee, 'id'>) => 
    setEmployees(prev => [...prev, { ...newEmp, id: generateEmployeeId() }]);
  
  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setAssignments(prev => prev.filter(a => a.employeeId !== id));
  };

  const addDuty = (newDuty: Omit<Duty, 'id'>) => 
    setDuties(prev => [...prev, { ...newDuty, id: generateDutyId() }]);
  
  const removeDuty = (id: string) => 
    setDuties(prev => prev.filter(d => d.id !== id));

  const addShift = (newShift: Omit<Shift, 'id'>) => 
    setShifts(prev => [...prev, { ...newShift, id: generateShiftId() }]);
  
  const removeShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    setAssignments(prev => prev.filter(a => a.shiftId !== id));
  };

  const removeAssignment = (id: string) => 
    setAssignments(prev => prev.filter(a => a.id !== id));

  const manualAssign = (shiftId: string, employeeId: string) => {
    if (assignments.some(a => 
      a.shiftId === shiftId && 
      a.employeeId === employeeId && 
      a.weekId === currentWeekId
    )) return;
    
    setAssignments(prev => [...prev, { 
      id: generateAssignmentId(), 
      shiftId, 
      employeeId, 
      weekId: currentWeekId 
    }]);
  };

  // Navigation
  const navigateWeek = (direction: number) => 
    setCurrentWeekStart(addWeeks(currentWeekStart, direction));

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar - Placeholder */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-slate-200`}>
        <div className="p-4">
          <h2 className="text-xl font-bold text-slate-800">Shift Scheduler</h2>
          <p className="text-sm text-slate-500">Restaurant Management</p>
        </div>
        {/* Sidebar content will go here */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4">
          <h1 className="text-2xl font-bold text-slate-800">
            Raspored - {currentWeekId}
          </h1>
        </header>

        {/* Schedule Grid - Placeholder */}
        <div className="flex-1 overflow-auto p-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Nedjelja {currentWeekId}</h3>
            <p className="text-slate-500">
              Komponente će biti implementirane: Sidebar, ScheduleGrid, ChatInterface
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <strong>Radnici:</strong> {employees.length}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <strong>Smjene:</strong> {shifts.length}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <strong>Dodjele:</strong> {weekAssignments.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel - Placeholder */}
      <div className={`${isChatOpen ? 'w-96' : 'w-0'} transition-all duration-300 bg-white border-l border-slate-200`}>
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold">AI Asistent</h3>
        </div>
        <div className="p-4">
          <p className="text-slate-500">
            Chat komponenta će biti implementirana
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
