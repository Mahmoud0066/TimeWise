
export interface Worker {
  id: string; // Use email as unique ID for simplicity with localStorage
  email: string;
  name: string;
  password?: string; // Add optional password field
}

export interface AttendanceRecord {
  id: string; // e.g., `${workerEmail}_${date}`
  workerEmail: string;
  workerName?: string; // Denormalized for easier display
  date: string; // YYYY-MM-DD
  checkInTime: string; // ISO timestamp string
  paid: boolean;
}

export type UserRole = 'admin' | 'worker';

export interface AuthenticatedUser {
  email: string;
  role: UserRole;
  name?: string; // Add optional name field
}
