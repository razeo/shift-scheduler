// ===========================================
// Main App Component
// RestoHub - Restaurant Management System
// ===========================================

import { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Menu, Settings, Bell } from 'lucide-react';
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
import { DailyReport } from './components/DailyReport';
import { ShiftHandover } from './components/ShiftHandover';
import { OutOfStock } from './components/OutOfStock';
import { ResponsibilityPlan } from './components/ResponsibilityPlan';
import { RoomService } from './components/RoomService';
import { WasteList } from './components/WasteList';
import { DailyMenu } from './components/DailyMenu';
import { AllergenGuide } from './components/AllergenGuide';
import { processScheduleRequest, isAiConfigured } from './services/ai';
import { useNotifications } from './hooks/useNotifications';
import { isFcmConfigured, isTelegramConfigured } from './services/notifications';

type PageType = 'schedule' | 'handover' | 'report' | 'outofstock' | 'responsibility' | 'roomservice' | 'wastelist' | 'dailymenu' | 'allergens' | 'settings';

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
  // Initialize notifications
  const {
    requestPermission,
    registerToken,
    hasPermission,
    isFcmReady,
    isTelegramReady,
    fcmToken,
    getUserId,
  } = useNotifications();

  // Set print date on mount
  useEffect(() => {
    document.body.setAttribute('data-print-date', new Date().toLocaleDateString('hr-HR'));
  }, []);

  // Initialize notification services on app load
  useEffect(() => {
    const initializeNotifications = async () => {
      // Check if notifications are configured
      if (!isFcmConfigured() && !isTelegramConfigured()) {
        console.log('Notification services not configured');
        return;
      }

      // Request permission and register token
      const permissionGranted = await requestPermission();
      if (permissionGranted && fcmToken) {
        await registerToken();
      }
    };

    // Only initialize on first load (not on every render)
    const initialized = sessionStorage.getItem('notifications_initialized');
    if (!initialized) {
      initializeNotifications();
      sessionStorage.setItem('notifications_initialized', 'true');
    }
  }, []);

  // Show toast for incoming notifications (foreground)
  useEffect(() => {
    // This would be connected to Firebase onMessage handler
    // For now, we'll simulate notification toasts
    const handleNotification = (event: CustomEvent) => {
      const { title, body } = event.detail;
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-white shadow-lg rounded-lg p-4 max-w-sm`}>
          <div className="flex items-center gap-3">
            <Bell className="text-blue-500" size={20} />
            <div>
              <p className="font-medium text-slate-800">{title}</p>
              <p className="text-sm text-slate-600">{body}</p>
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    };

    window.addEventListener('restohub:notification', handleNotification as EventListener);
    return () => window.removeEventListener('restohub:notification', handleNotification as EventListener);
  }, []);

  useEffect(() => {
    runMigrations();
  }, []);

  const [currentPage, setCurrentPage] = useState<PageType>('schedule');
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const currentWeekId = useMemo(() => formatDateToId(currentWeekStart), [currentWeekStart]);
  const weekAssignments = useMemo(() => 
    assignments.filter(a => a.weekId === currentWeekId),
    [assignments, currentWeekId]
  );

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

  const removeAssignment = (id: string) => {
    const filtered = assignments.filter(a => a.id !== id);
    setAssignments(filtered);
    setStorageItem(STORAGE_KEYS.ASSIGNMENTS, filtered);
  };

  const manualAssign = (shiftId: string, employeeId: string, day: DayOfWeek) => {
    const isDuplicate = assignments.some(a => 
      a.shiftId === shiftId && 
      a.employeeId === employeeId && 
      a.day === day &&
      a.weekId === currentWeekId
    );
    
    if (isDuplicate) {
      return false; // Silent fail
    }
    
    const newAssignment: Assignment = { 
      id: generateAssignmentId(), 
      shiftId, 
      employeeId, 
      weekId: currentWeekId,
      day 
    };
    
    setAssignments(prev => {
      const updated = [...prev, newAssignment];
      setStorageItem(STORAGE_KEYS.ASSIGNMENTS, updated);
      return updated;
    });
    
    return true;
  };

  const navigateWeek = (direction: number) => 
    setCurrentWeekStart(addWeeks(currentWeekStart, direction));

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
      m.id === messageId ? { ...m, status: 'applied' as const } : m
    ));
    toast.success('Izmjene primijenjene');
  };

  const handleDiscardChanges = (messageId: string) => {
    setChatMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'discarded' as const } : m
    ));
    toast.success('Izmjene odbacene');
  };

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

  const handlePageChange = (page: string) => {
    setCurrentPage(page as PageType);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Toaster position="top-right" />
      
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
          <ShiftHandover onClose={() => { setCurrentPage('schedule'); setIsSidebarOpen(true); }} />
        )}

        {currentPage === 'report' && (
          <DailyReport onClose={() => { setCurrentPage('schedule'); setIsSidebarOpen(true); }} />
        )}

        {currentPage === 'outofstock' && (
          <OutOfStock onClose={() => { setCurrentPage('schedule'); setIsSidebarOpen(true); }} />
        )}

        {currentPage === 'responsibility' && (
          <ResponsibilityPlan onClose={() => { setCurrentPage('schedule'); setIsSidebarOpen(true); }} />
        )}

        {currentPage === 'roomservice' && (
          <RoomService onClose={() => { setCurrentPage('schedule'); setIsSidebarOpen(true); }} />
        )}

        {currentPage === 'wastelist' && (
          <WasteList onClose={() => { setCurrentPage('schedule'); setIsSidebarOpen(true); }} />
        )}

        {currentPage === 'dailymenu' && (
          <DailyMenu onClose={() => { setCurrentPage('schedule'); setIsSidebarOpen(true); }} />
        )}

        {currentPage === 'allergens' && (
          <AllergenGuide onClose={() => { setCurrentPage('schedule'); setIsSidebarOpen(true); }} />
        )}

        {currentPage === 'settings' && (
          <div className="flex-1 flex items-center justify-center bg-slate-100 p-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
              <div className="flex items-center gap-4 mb-8">
                <Settings size={32} className="text-slate-400" />
                <div>
                  <h2 className="text-xl font-bold text-slate-700">Postavke</h2>
                  <p className="text-slate-500">Upravljanje postavkama aplikacije</p>
                </div>
              </div>

              {/* Notification Status */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Obavijesti</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* FCM Status */}
                  <div className={`p-4 rounded-xl border-2 ${
                    hasPermission && isFcmReady 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Bell size={20} className={hasPermission && isFcmReady ? 'text-green-600' : 'text-slate-400'} />
                      <span className="font-medium text-slate-700">Push obavijesti</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {hasPermission 
                        ? isFcmReady 
                          ? '✅ Aktivne' 
                          : '⚠️ Konfiguracija nedostaje'
                        : '❌ Onemogućeno'}
                    </p>
                    {!hasPermission && (
                      <button
                        onClick={requestPermission}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Omogući obavijesti
                      </button>
                    )}
                  </div>

                  {/* Telegram Status */}
                  <div className={`p-4 rounded-xl border-2 ${
                    isTelegramReady 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <svg viewBox="0 0 24 24" width={20} height={20} fill={isTelegramReady ? '#22c55e' : '#94a3b8'} className="mt-1">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-.94-2.4-1.54-1.06-.7-.37-1.09.23-1.71.14-.15 2.54-2.32 2.59-2.52.01-.03.01-.13-.05-.18-.06-.05-.16-.02-.23-.01-.09.02-1.4 1.02-3.8 3.07-.2.17-.38.26-.54.26-.31 0-.48-.22-.54-.52-.06-.33-.19-1.05-.23-1.33-.02-.15-.06-.3-.15-.43-.09-.13-.22-.21-.36-.21-.17 0-.34.09-.49.21-.21.18-.86.76-1.25 1.13-.11.1-.2.19-.29.3-.11.14-.21.27-.18.56.03.37.4.77.78 1.05 2.22 1.63 3.79 2.65 4.49 3.14.88.62 1.58 1.18 1.87 1.42.53.44.91.82 1.08 1.35.11.35.09.79-.05 1.19-.19.53-.63 1.08-1.21 1.24-.39.11-.77.08-1.15-.1-.45-.22-.86-.52-1.26-.86-.24-.21-.48-.43-.73-.63-.11-.09-.23-.17-.35-.25.25-.09.48-.16.7-.24.56-.2 1.04-.33 1.44-.56.76-.44 1.43-1.05 1.92-1.79.51-.76.8-1.65.84-2.6.01-.18.01-.36 0-.54.05-1.03-.05-2.07-.28-3.1z"/>
                      </svg>
                      <span className="font-medium text-slate-700">Telegram</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {isTelegramReady 
                        ? '✅ Povezan' 
                        : '⚠️ Konfiguracija nedostaje'}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-medium text-slate-700 mb-2">ID Korisnika</h4>
                <p className="text-sm text-slate-500 font-mono">{getUserId()}</p>
                <p className="text-xs text-slate-400 mt-2">Koristi se za registraciju obavijesti</p>
              </div>
            </div>
          </div>
        )}
        
        {!isSidebarOpen && (
           <button 
            className="lg:hidden absolute top-6 left-6 z-[60] p-3 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100"
            onClick={() => setIsSidebarOpen(true)}
           >
            <Menu size={20} />
           </button>
        )}
      </div>

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
