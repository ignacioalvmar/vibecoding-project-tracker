import { useEffect, useState } from 'react';

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Reads storage synchronously in the lazy initializer, so the very first
 * render already has the saved board (no empty-board flash).
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 *
 * @template T
 * @param {string} key
 * @param {T | (() => T)} initialValue
 * @returns {[T, import('react').Dispatch<import('react').SetStateAction<T>>]}
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const fallback = typeof initialValue === 'function' ? initialValue() : initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}
