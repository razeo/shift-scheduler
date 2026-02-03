// ===========================================
// Storage Utilities with Migration Support
// Handles localStorage cleanup and data consistency
// ===========================================

import { Assignment, ShiftTemplate } from '../types/index';

const STORAGE_KEYS = {
  EMPLOYEES: 'shift_scheduler_employees',
  DUTIES: 'shift_scheduler_duties',
  SHIFTS: 'shift_scheduler_shifts',
  ASSIGNMENTS: 'shift_scheduler_assignments',
  AI_RULES: 'shift_scheduler_ai_rules',
  TEMPLATES: 'shift_scheduler_templates',
  VERSION: 'shift_scheduler_version',
};

const CURRENT_VERSION = 2;

/**
 * Get item from localStorage with error handling
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    const parsed = JSON.parse(item);
    
    // Validate array
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.warn(`[Storage] ${key} is not an array, using default`);
      return defaultValue;
    }
    
    return parsed;
  } catch (error) {
    console.warn(`[Storage] Error reading ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Set item to localStorage with error handling
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[Storage] Error writing ${key}:`, error);
  }
}

/**
 * Run migrations and cleanup
 */
export function runMigrations(): void {
  const storedVersion = getStorageItem<number>(STORAGE_KEYS.VERSION, 0);
  
  console.log(`[Storage] Running migrations: ${storedVersion} -> ${CURRENT_VERSION}`);
  
  // Migration v1: Clean up stale assignments
  if (storedVersion < 1) {
    migrateToV1();
  }
  
  // Migration v2: Add templates support
  if (storedVersion < 2) {
    migrateToV2();
  }
  
  // Save current version
  setStorageItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
  
  console.log('[Storage] Migrations complete');
}

/**
 * Migration v1: Remove invalid assignments and duplicates
 */
function migrateToV1(): void {
  const assignments = getStorageItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  
  if (assignments.length === 0) return;
  
  // Find duplicates (same shiftId + employeeId + weekId)
  const seen = new Set<string>();
  const validAssignments: Assignment[] = [];
  
  for (const assignment of assignments) {
    const key = `${assignment.shiftId}-${assignment.employeeId}-${assignment.weekId}`;
    
    if (seen.has(key)) continue;
    
    // Validate required fields
    if (!assignment.shiftId || !assignment.employeeId || !assignment.weekId) continue;
    
    seen.add(key);
    validAssignments.push(assignment);
  }
  
  setStorageItem(STORAGE_KEYS.ASSIGNMENTS, validAssignments);
  console.log(`[Storage] v1 migration: ${validAssignments.length} valid assignments`);
}

/**
 * Migration v2: Initialize templates storage
 */
function migrateToV2(): void {
  // Ensure templates key exists
  const templates = getStorageItem<ShiftTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
  setStorageItem(STORAGE_KEYS.TEMPLATES, templates);
  console.log(`[Storage] v2 migration: templates initialized`);
}

/**
 * Clear all app storage
 */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[Storage] Error removing ${key}:`, error);
    }
  });
  console.log('[Storage] All data cleared');
}

/**
 * Export data to JSON file
 */
export function exportToJSON<T>(data: T, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(h => {
        const val = row[h];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import JSON from file
 */
export function importFromJSON<T = unknown>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target?.result as string) as T);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export { STORAGE_KEYS };
