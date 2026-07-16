// ─── API Types ─────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  type: 'EXPENSE' | 'HABIT';
}

export interface ExpenseRequest {
  amount: number;
  description?: string;
  date: string;
  categoryId: number;
}

export interface ExpenseResponse {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
  categoryName: string;
}

export interface ExpenseSummaryItem {
  categoryId: number;
  categoryName: string;
  total: number;
  percentage: number;
}

export interface ExpensePageResponse {
  content: ExpenseResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
}

export interface ExpenseSummaryResponse {
  totalAmount: number;
  transactionCount: number;
  breakdown: ExpenseSummaryItem[];
}

export interface HabitRequest {
  name: string;
  frequency?: string;
}

export interface HabitLogEntry {
  id: number;
  date: string;
  completed: boolean;
}

export interface HabitResponse {
  id: number;
  name: string;
  frequency: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  recentLogs: HabitLogEntry[];
}

export interface HabitLogRequest {
  date?: string;
  completed?: boolean;
}

export interface StreakResponse {
  habitId: number;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  token: string;
}
