import { DayOfWeek, Employee, Role, Duty, Shift } from './types';

export const DAYS_ORDER = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY
];

// Ostavljamo prazno po želji korisnika
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_DUTIES: Duty[] = [];
export const DEFAULT_AI_RULES = "";
export const INITIAL_SHIFTS: Shift[] = [];
