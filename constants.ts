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

// Sample data for demo purposes
export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Marko Novak', role: Role.SERVER },
  { id: 'emp-2', name: 'Ana Kovač', role: Role.CHEF },
  { id: 'emp-3', name: 'Josip Horvat', role: Role.BARTENDER },
  { id: 'emp-4', name: 'Maja Petrović', role: Role.HOST },
  { id: 'emp-5', name: 'Ivan Jurić', role: Role.SERVER },
  { id: 'emp-6', name: 'Tea Marić', role: Role.DISHWASHER },
  { id: 'emp-7', name: 'Luka Stošić', role: Role.HEAD_WAITER },
];

export const INITIAL_DUTIES: Duty[] = [
  { id: 'dt-1', label: 'Roštilj' },
  { id: 'dt-2', label: 'Pizza peć' },
  { id: 'dt-3', label: 'Bar' },
  { id: 'dt-4', label: 'Ulaz' },
  { id: 'dt-5', label: 'Kasa' },
];

export const INITIAL_SHIFTS: Shift[] = [
  { id: 'sh-1', day: DayOfWeek.MONDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-2', day: DayOfWeek.MONDAY, startTime: '16:00', endTime: '24:00', label: 'Večernja' },
  { id: 'sh-3', day: DayOfWeek.TUESDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-4', day: DayOfWeek.TUESDAY, startTime: '16:00', endTime: '24:00', label: 'Večernja' },
  { id: 'sh-5', day: DayOfWeek.WEDNESDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-6', day: DayOfWeek.WEDNESDAY, startTime: '16:00', endTime: '24:00', label: 'Večernja' },
  { id: 'sh-7', day: DayOfWeek.THURSDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-8', day: DayOfWeek.THURSDAY, startTime: '16:00', endTime: '24:00', label: 'Večernja' },
  { id: 'sh-9', day: DayOfWeek.FRIDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-10', day: DayOfWeek.FRIDAY, startTime: '16:00', endTime: '24:00', label: 'Večernja' },
  { id: 'sh-11', day: DayOfWeek.SATURDAY, startTime: '10:00', endTime: '18:00', label: 'Dnevna' },
  { id: 'sh-12', day: DayOfWeek.SATURDAY, startTime: '18:00', endTime: '02:00', label: 'Noćna' },
  { id: 'sh-13', day: DayOfWeek.SUNDAY, startTime: '10:00', endTime: '18:00', label: 'Dnevna' },
  { id: 'sh-14', day: DayOfWeek.SUNDAY, startTime: '18:00', endTime: '02:00', label: 'Noćna' },
];

export const DEFAULT_AI_RULES = "Raspored treba ravnomjerno raspodijeliti smjene među radnicima. Izbjegavajte uzastopne noćne smjene. Osigurajte da svaki dan ima dovoljno kuhara i konobara.";
