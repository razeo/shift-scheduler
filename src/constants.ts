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

// Default schedule data
export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1768852711762', name: 'Snezana', role: Role.BARTENDER, availability: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY] },
  { id: 'emp-1768852740875', name: 'Vidak', role: Role.HEAD_WAITER, availability: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY] },
  { id: 'emp-1768852766040', name: 'Ivana', role: Role.BARTENDER, availability: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY] },
  { id: 'emp-1768852773016', name: 'Katarina', role: Role.BARTENDER, availability: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY] },
  { id: 'emp-1768852790017', name: 'Zeljko', role: Role.SERVER, availability: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY] },
  { id: 'emp-1768852804296', name: 'Radosav', role: Role.HEAD_WAITER, availability: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY] },
];

export const INITIAL_DUTIES: Duty[] = [];

export const INITIAL_SHIFTS: Shift[] = [
  { id: 'sh-1768852834939', day: DayOfWeek.MONDAY, startTime: '07:00', endTime: '14:30', label: '1st Shift', notes: '' },
  { id: 'sh-1768852863543', day: DayOfWeek.MONDAY, startTime: '14:30', endTime: '22:00', label: '2nd Shift', notes: '' },
  { id: 'sh-1768852888893', day: DayOfWeek.TUESDAY, startTime: '07:00', endTime: '14:30', label: '1st Shift', notes: '' },
  { id: 'sh-1768852909274', day: DayOfWeek.TUESDAY, startTime: '14:30', endTime: '22:00', label: '2nd Shift', notes: '' },
  { id: 'sh-1768852922770', day: DayOfWeek.WEDNESDAY, startTime: '07:00', endTime: '14:30', label: '1st Shift', notes: '' },
  { id: 'sh-1768852941380', day: DayOfWeek.WEDNESDAY, startTime: '14:30', endTime: '22:00', label: '2nd Shift', notes: '' },
  { id: 'sh-1768852959354', day: DayOfWeek.THURSDAY, startTime: '07:00', endTime: '14:30', label: '1st Shift', notes: '' },
  { id: 'sh-1768854115245', day: DayOfWeek.THURSDAY, startTime: '14:30', endTime: '22:00', label: '2nd Shift', notes: '' },
  { id: 'sh-1768852997623', day: DayOfWeek.FRIDAY, startTime: '07:00', endTime: '14:30', label: '1st Shift', notes: '' },
  { id: 'sh-1768853017074', day: DayOfWeek.FRIDAY, startTime: '14:30', endTime: '22:00', label: '2nd Shift', notes: '' },
  { id: 'sh-1768853034031', day: DayOfWeek.SATURDAY, startTime: '07:00', endTime: '14:30', label: '1st Shift', notes: '' },
  { id: 'sh-1768853056772', day: DayOfWeek.SATURDAY, startTime: '14:30', endTime: '22:00', label: '2nd Shift', notes: '' },
  { id: 'sh-1768853080093', day: DayOfWeek.SUNDAY, startTime: '07:00', endTime: '14:30', label: '1st Shift', notes: '' },
  { id: 'sh-1768853104521', day: DayOfWeek.SUNDAY, startTime: '14:30', endTime: '22:00', label: '2nd Shift', notes: '' },
  { id: 'sh-1768855923981', day: DayOfWeek.MONDAY, startTime: '09:00', endTime: '17:00', label: '925 Shift', notes: '' },
  { id: 'sh-1768855953045', day: DayOfWeek.TUESDAY, startTime: '09:00', endTime: '17:00', label: '925 Shift', notes: '' },
  { id: 'sh-1768855980684', day: DayOfWeek.WEDNESDAY, startTime: '09:00', endTime: '17:00', label: '925 Shift', notes: '' },
  { id: 'sh-1768856001460', day: DayOfWeek.THURSDAY, startTime: '09:00', endTime: '17:00', label: '925 Shift', notes: '' },
  { id: 'sh-1768856018062', day: DayOfWeek.FRIDAY, startTime: '09:00', endTime: '17:00', label: '925 Shift', notes: '' },
  { id: 'sh-1768856056259', day: DayOfWeek.SATURDAY, startTime: '09:00', endTime: '17:00', label: '925 Shift', notes: '' },
  { id: 'sh-1768856075547', day: DayOfWeek.SUNDAY, startTime: '09:00', endTime: '17:00', label: '925 Shift', notes: '' },
];

export const DEFAULT_AI_RULES = `-Svaka smjena ima najmanje po jednog konobara i po jednog bartendera
-Svaki zaposleni ima samo po jedan slobodan dan u radnoj nedelji
-Kada je god to moguće, Radosav radi jednu smjenu, a Vidak drugu smjenu kao server.
-Kada god je to moguće, Ivana i Vidak rade zajedno u smjeni, ali to ne mora uvijek da bude samo jutarnja ili samo popodnevna
-Zeljko je inace FB Manager, ali zbog nedostatka osoblja uskače da odradi posao servera i treba ga tretirati kao nekoga ko radi samo kad je to baš potrebno. Npr. Iako Snežana ima iskustva ipak je ona više bartender nego server i u slučaju da je ona jedini server u smjeni toj smjeni treba dodjeliti Željka kao glavnog servera. Kada Zeljko nije potreban u 1st shift ili 2nd shift dodjeli mu 925 Shift tj njegova smjena pocinje u 09:00 a zavrsava u 17:00
-Snežana ima iskustvo i može da pokriva i poziciju servera iako joj je glavna pozicija bartender, tako da i to treba imati u vidu pri generisanju rasporeda`;
