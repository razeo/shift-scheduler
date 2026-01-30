// ===========================================
// ID Generation Utilities
// Consistent ID generation for the application
// ===========================================

/**
 * Generate a unique ID with timestamp and random suffix
 * Format: prefix-timestamp-random
 * Example: emp-1738252800-abc12
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a simple timestamp-based ID
 * Format: prefix-timestamp
 * Example: emp-1738252800
 */
export function generateTimestampId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

/**
 * Generate a short random ID
 * Format: prefix-random
 * Example: emp-abc12
 */
export function generateShortId(prefix: string): string {
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${random}`;
}

/**
 * Generate an AI-assigned ID
 * Format: prefix-ai-timestamp-random
 * Example: emp-ai-1738252800-abc12
 */
export function generateAiId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 5);
  return `asg-ai-${timestamp}-${random}`;
}

/**
 * Entity type prefixes for consistency
 */
export const ID_PREFIXES = {
  EMPLOYEE: 'emp',
  DUTY: 'dt',
  SHIFT: 'sh',
  ASSIGNMENT: 'asg',
  MESSAGE: 'msg',
  NOTIFICATION: 'notif',
} as const;

export type IDPrefix = typeof ID_PREFIXES[keyof typeof ID_PREFIXES];

/**
 * Convenience functions for common entity types
 */
export const generateEmployeeId = () => generateId(ID_PREFIXES.EMPLOYEE);
export const generateDutyId = () => generateId(ID_PREFIXES.DUTY);
export const generateShiftId = () => generateId(ID_PREFIXES.SHIFT);
export const generateAssignmentId = () => generateId(ID_PREFIXES.ASSIGNMENT);
export const generateMessageId = () => generateTimestampId(ID_PREFIXES.MESSAGE);
