
"use client";

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

// Helper function to safely get value from localStorage
function getStorageValue<T>(key: string, defaultValue: T): T {
  // This function will only run on the client side due to the useEffect hook below
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        // Attempt to parse the stored JSON
        const parsed = JSON.parse(saved);
        // Basic type check: If defaultValue is provided and parsed value type doesn't match, fallback
        // This is a very basic check and might need refinement based on specific needs
        if (defaultValue !== null && typeof parsed !== typeof defaultValue) {
            // console.warn(`Type mismatch for localStorage key "${key}". Expected ${typeof defaultValue}, got ${typeof parsed}. Falling back to default.`);
            return defaultValue;
        }
        return parsed;
      } catch (error) {
        console.error(`Error parsing localStorage key “${key}”:`, error);
        // Fallback to default value if parsing fails
        return defaultValue;
      }
    }
  }
  // Return default value if on server or key not found/error parsing
  return defaultValue;
}

// Return type includes the loading state
type UseLocalStorageReturn<T> = [T | undefined, Dispatch<SetStateAction<T | undefined>>, boolean];

export function useLocalStorage<T>(key: string, defaultValue: T): UseLocalStorageReturn<T> {
  // Initialize state to undefined to indicate loading
  const [value, setValue] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); // Start loading

  // Effect to load the value from localStorage on mount (client-side only)
  useEffect(() => {
    // Ensure this runs only on the client
    const storedValue = getStorageValue(key, defaultValue);
    setValue(storedValue);
    setIsLoading(false); // Finished loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Depend only on key

  // Effect to update localStorage when value changes (and is not undefined)
  useEffect(() => {
    // Ensure this runs only on the client and value is loaded
    if (typeof window !== 'undefined' && value !== undefined) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, value]);

  // The setter function remains largely the same, but operates on T | undefined
  const setStoredValue: Dispatch<SetStateAction<T | undefined>> = useCallback((newValue) => {
    setValue(prevValue => {
      const valueToStore = newValue instanceof Function ? newValue(prevValue) : newValue;
      // Update state. The effect above will handle localStorage persistence.
      return valueToStore;
    });
  }, [setValue]); // Dependency on setValue ensures stability

  // Return value, setter, and loading state
  return [value, setStoredValue, isLoading];
}
