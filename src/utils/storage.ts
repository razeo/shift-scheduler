// ===========================================
// Storage Utilities with Migration Support
// Handles localStorage cleanup and data consistency
// ===========================================

import { Assignment } from '../types';

const STORAGE_KEYS = {
  EMPLOYEES: 'shift_scheduler_employees',
  DUTIES: 'shift_scheduler_duties',
  SHIFTS: 'shift_scheduler_shifts',
  ASSIGNMENTS: 'shift_scheduler_assignments',
  AI_RULES: 'shift_scheduler_ai_rules',
  VERSION: 'shift_scheduler_version',
};

const CURRENT_VERSION = 1;

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
  
  // Migration from v0 to v1: Clean up stale assignments
  if (storedVersion < 1) {
    migrateToV1();
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
  
  if (assignments.length === 0) {
    console.log('[Storage] No assignments to migrate');
    return;
  }
  
  console.log(`[Storage] Migrating ${assignments.length} assignments...`);
  
  // Find duplicates (same shiftId + employeeId + weekId)
  const seen = new Set<string>();
  const validAssignments: Assignment[] = [];
  const duplicatesRemoved = new Set<string>();
  
  for (const assignment of assignments) {
    const key = `${assignment.shiftId}-${assignment.employeeId}-${assignment.weekId}`;
    
    if (seen.has(key)) {
      duplicatesRemoved.add(assignment.id);
      continue;
    }
    
    // Validate required fields
    if (!assignment.shiftId || !assignment.employeeId || !assignment.weekId) {
      console.log(`[Storage] Removing invalid assignment:`, assignment.id);
      continue;
    }
    
    seen.add(key);
    validAssignments.push(assignment);
  }
  
  // Save cleaned assignments
  setStorageItem(STORAGE_KEYS.ASSIGNMENTS, validAssignments);
  
  console.log(`[Storage] Migration complete: ${validAssignments.length} valid, ${duplicatesRemoved.size} duplicates removed`);
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

export { STORAGE_KEYS };
