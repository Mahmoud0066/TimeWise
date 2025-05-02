
"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { AuthenticatedUser, UserRole } from '@/lib/types';
import { useLocalStorage } from './use-local-storage';

interface AuthContextType {
  user: AuthenticatedUser | null | undefined; // Undefined signifies loading state
  login: (email: string, role: UserRole, name?: string) => void; // Add optional name parameter
  logout: () => void;
  isLoading: boolean; // Explicit loading state
}

// Using undefined is standard practice for context initial value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use useLocalStorage to manage the user state persistence
  // It now returns [value, setValue, isLoading]
  const [user, setUser, isAuthLoading] = useLocalStorage<AuthenticatedUser | null>(
    'authUser',
    null // Default value is null (not logged in)
  );

  // useCallback ensures these functions maintain identity across renders unless dependencies change
  const login = useCallback(
    (email: string, role: UserRole, name?: string) => { // Accept name parameter
      const newUser: AuthenticatedUser = { email, role, name }; // Include name in the user object
      setUser(newUser); // Update state and localStorage via the hook
    },
    [setUser]
  );

  const logout = useCallback(() => {
    setUser(null); // Clear state and localStorage via the hook
    // Optionally clear other related localStorage items here if needed
  }, [setUser]);

  // Define the context value object including the loading state
  // User state can be T | undefined | null. isLoading is boolean.
  const contextValue = { user, login, logout, isLoading: isAuthLoading };

  // Return the provider with the context value
  // Ensure JSX syntax is correct
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  // Ensure the hook is used within a provider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
