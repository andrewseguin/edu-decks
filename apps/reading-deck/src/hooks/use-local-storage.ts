"use client";

import { useState, useEffect, useCallback } from "react";

export default function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    // This effect runs only on the client, after hydration
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
    }
  }, [key]);

  const setLocalStorageValue = useCallback(
    (newValue: T | ((val: T) => T)) => {
      setValue((currentValue) => {
        const valueToStore =
          newValue instanceof Function ? newValue(currentValue) : newValue;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        } catch (error) {
          console.warn(`Error setting localStorage key “${key}”:`, error);
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [value, setLocalStorageValue];
}
