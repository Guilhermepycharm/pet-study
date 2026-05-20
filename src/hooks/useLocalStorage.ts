import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T, migrate?: (raw: unknown) => T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      const parsed = JSON.parse(item);
      if (parsed === null || parsed === undefined) return initialValue;
      if (migrate) return migrate(parsed);
      return parsed as T;
    } catch (error) {
      console.warn(`[useLocalStorage] Corrupted data for key "${key}", resetting:`, error);
      try { window.localStorage.removeItem(key); } catch { /* ignore */ }
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
