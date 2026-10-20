import { useEffect, useState } from "react";

/**
 * Like useState, but the value is kept in sessionStorage under `key`, so it
 * survives navigating away from the page (and reloads) within the same tab.
 */
export function useSessionState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  }, [key, value]);

  return [value, setValue] as const;
}
