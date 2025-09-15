/**
 * Utility functions for generating unique IDs that work on both server and client
 */

let counter = 0;

/**
 * Generate a unique ID that works on both server and client
 * This prevents hydration mismatches by using a deterministic approach
 */
export function generateId(prefix = 'id'): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

/**
 * Generate a random string for use in IDs
 */
export function generateRandomString(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a message ID
 */
export function generateMessageId(role: 'user' | 'assistant'): string {
  return generateId(role);
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return generateId('session');
}