// ===========================================
// Core Types for Shift Scheduler
// ===========================================

export enum Role {
  SERVER = 'Server',
  CHEF = 'Chef',
  BARTENDER = 'Bartender',
  HOST = 'Host',
  MANAGER = 'Manager',
  DISHWASHER = 'Dishwasher',
  HEAD_WAITER = 'Head Waiter',
}

export enum DayOfWeek {
  MONDAY = 'Ponedjeljak',
  TUESDAY = 'Utorak',
  WEDNESDAY = 'Srijeda',
  THURSDAY = 'Četvrtak',
  FRIDAY = 'Petak',
  SATURDAY = 'Subota',
  SUNDAY = 'Nedjelja',
}

// ===========================================
// Entity Types
// ===========================================

export interface Employee {
  id: string;
  name: string;
  role: Role;
  availability?: DayOfWeek[]; // Days the employee is available to work
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Duty {
  id: string;
  label: string;
  color?: string;
  icon?: string;
}

export interface Shift {
  id: string;
  day: DayOfWeek;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  label: string;
  notes?: string;
  color?: string;
}

export interface Assignment {
  id: string;
  shiftId: string;
  employeeId: string;
  weekId: string;    // ISO week format or Monday's YYYY-MM-DD
  specialDuty?: string;
  notes?: string;
}

// ===========================================
// Chat/AI Types
// ===========================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  pendingAssignments?: Omit<Assignment, 'id' | 'weekId'>[];
  pendingEmployees?: { name: string; role: string }[];
  status?: 'pending' | 'applied' | 'discarded';
}

export interface AIResponse {
  message: string;
  assignments: Omit<Assignment, 'id' | 'weekId'>[];
  newEmployees?: { name: string; role: string }[];
}

// ===========================================
// Schedule State
// ===========================================

export interface ScheduleState {
  employees: Employee[];
  shifts: Shift[];
  assignments: Assignment[];
  duties: Duty[];
  currentWeekId: string;
  aiRules?: string;
}

// ===========================================
// Week Types
// ===========================================

export interface WeekInfo {
  id: string;           // YYYY-MM-DD format (Monday's date)
  startDate: Date;
  endDate: Date;
  weekNumber: number;
  year: number;
}

// ===========================================
// Import/Export Types
// ===========================================

export interface ExportData {
  version: string;
  exportedAt: string;
  employees: Employee[];
  shifts: Shift[];
  duties: Duty[];
  assignments: Assignment[];
  aiRules?: string;
}

// ===========================================
// UI State Types
// ===========================================

export interface UIState {
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  isEmployeeModalOpen: boolean;
  isShiftModalOpen: boolean;
  isDutyModalOpen: boolean;
  editingEmployee?: Employee;
  editingShift?: Shift;
  editingDuty?: Duty;
}

// ===========================================
// Notification Types
// ===========================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// ===========================================
// Settings Types
// ===========================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  autoSave: boolean;
  notifications: boolean;
}
