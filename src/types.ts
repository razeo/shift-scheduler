
export enum Role {
  SERVER = 'Server',
  CHEF = 'Chef',
  BARTENDER = 'Bartender',
  HOST = 'Host',
  MANAGER = 'Manager',
  DISHWASHER = 'Dishwasher',
  HEAD_WAITER = 'Head Waiter'
}

export enum DayOfWeek {
  MONDAY = 'Ponedjeljak',
  TUESDAY = 'Utorak',
  WEDNESDAY = 'Srijeda',
  THURSDAY = 'Četvrtak',
  FRIDAY = 'Petak',
  SATURDAY = 'Subota',
  SUNDAY = 'Nedjelja'
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  availability?: DayOfWeek[]; // Days the employee is available to work
}

export interface Duty {
  id: string;
  label: string;
}

export interface Shift {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  label: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  shiftId: string;
  employeeId: string;
  weekId: string; // ISO week format or Monday's YYYY-MM-DD
  day: DayOfWeek; // Day of the week for this specific assignment
  specialDuty?: string;
}

export interface ScheduleState {
  employees: Employee[];
  shifts: Shift[];
  assignments: Assignment[];
  duties: Duty[];
  currentWeekId: string;
  aiRules?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  pendingAssignments?: Omit<Assignment, 'id' | 'weekId'>[];
  pendingEmployees?: { name: string; role: string }[];
  status?: 'pending' | 'applied' | 'discarded';
}
