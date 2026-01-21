/**
 * Safe JSON parsing utilities
 * Prevents crashes from undefined, null, or invalid JSON strings
 */

/**
 * Safely parse JSON with a fallback value
 * Handles undefined, null, empty strings, and invalid JSON
 */
export function safeParse<T>(json: string | null | undefined, fallback: T): T {
  // Guard against undefined, null, empty string
  if (!json || json === 'undefined' || json === 'null') {
    return fallback;
  }
  
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.warn('[safeParse] Failed to parse JSON:', error, 'Input:', json?.substring?.(0, 100));
    return fallback;
  }
}

/**
 * Safely get and parse from localStorage
 */
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  
  try {
    const value = localStorage.getItem(key);
    return safeParse(value, fallback);
  } catch (error) {
    console.warn(`[safeLocalStorageGet] Failed to get ${key}:`, error);
    return fallback;
  }
}

/**
 * Safely get and parse from sessionStorage
 */
export function safeSessionStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  
  try {
    const value = sessionStorage.getItem(key);
    return safeParse(value, fallback);
  } catch (error) {
    console.warn(`[safeSessionStorageGet] Failed to get ${key}:`, error);
    return fallback;
  }
}

/**
 * Safely set to localStorage
 */
export function safeLocalStorageSet(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[safeLocalStorageSet] Failed to set ${key}:`, error);
    return false;
  }
}

/**
 * Safely set to sessionStorage
 */
export function safeSessionStorageSet(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[safeSessionStorageSet] Failed to set ${key}:`, error);
    return false;
  }
}
