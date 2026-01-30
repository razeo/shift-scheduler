// ===========================================
// Date Utilities for Shift Scheduler
// Week calculations, formatting, and date helpers
// ===========================================

import { DayOfWeek } from '../types';

// Week ID format constant
export const WEEK_ID_FORMAT = 'YYYY-MM-DD';

/**
 * Get the Monday of the current week
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateToId(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse YYYY-MM-DD string to Date
 */
export function parseDateFromId(id: string): Date | null {
  const match = id.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Get all days of the week starting from Monday
 */
export function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * Get the week ID for a given date
 */
export function getWeekId(date: Date): string {
  return formatDateToId(getMonday(date));
}

/**
 * Navigate N weeks from current week
 */
export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

/**
 * Get day name in Croatian
 */
export function getDayName(date: Date): string {
  const days = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
  return days[date.getDay()];
}

/**
 * Get short day name (2-3 chars)
 */
export function getShortDayName(date: Date): string {
  const days = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
  return days[date.getDay()];
}

/**
 * Convert DayOfWeek enum to date
 */
export function dayOfWeekToDate(weekStart: Date, day: DayOfWeek): Date {
  const dayMap: Record<string, number> = {
    [DayOfWeek.MONDAY]: 0,
    [DayOfWeek.TUESDAY]: 1,
    [DayOfWeek.WEDNESDAY]: 2,
    [DayOfWeek.THURSDAY]: 3,
    [DayOfWeek.FRIDAY]: 4,
    [DayOfWeek.SATURDAY]: 5,
    [DayOfWeek.SUNDAY]: 6,
  };
  const dayIndex = dayMap[day] ?? 0;
  return new Date(weekStart.getTime() + dayIndex * 24 * 60 * 60 * 1000);
}

/**
 * Format time for display (HH:MM)
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if date is within the current week
 */
export function isInCurrentWeek(date: Date, weekStart: Date): boolean {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return date >= weekStart && date <= weekEnd;
}

/**
 * Get week number (ISO week)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
