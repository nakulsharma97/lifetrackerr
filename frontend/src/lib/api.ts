import axios from 'axios';
import type { AuthResponse } from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── JWT Interceptor ───────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),

  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, email, password }),
};

// ─── Categories ────────────────────────────────────────────

export const categoryApi = {
  list: (type: 'EXPENSE' | 'HABIT') =>
    api.get('/categories', { params: { type } }),
};

// ─── Expenses ──────────────────────────────────────────────

export const expenseApi = {
  list: (params?: { from?: string; to?: string; categoryId?: string | number; page?: number; size?: number }) =>
    api.get('/expenses', { params }),

  summary: () => api.get('/expenses/summary'),

  monthlyTrend: (months?: number) =>
    api.get('/expenses/monthly-trend', { params: { months } }),

  create: (data: {
    amount: number;
    description?: string;
    date: string;
    categoryId: number;
  }) => api.post('/expenses', data),

  update: (
    id: number,
    data: {
      amount: number;
      description?: string;
      date: string;
      categoryId: number;
    }
  ) => api.put(`/expenses/${id}`, data),

  delete: (id: number) => api.delete(`/expenses/${id}`),
};

// ─── Habits ────────────────────────────────────────────────

export const habitApi = {
  list: () => api.get('/habits'),

  streaks: () => api.get('/habits/streaks'),

  create: (data: { name: string; frequency?: string }) =>
    api.post('/habits', data),

  update: (id: number, data: { name: string; frequency?: string }) =>
    api.put(`/habits/${id}`, data),

  delete: (id: number) => api.delete(`/habits/${id}`),

  log: (id: number, data: { date?: string; completed?: boolean; note?: string }) =>
    api.post(`/habits/${id}/log`, data),
};

// ─── Recurring Expenses ────────────────────────────────────

export const recurringApi = {
  list: () => api.get('/recurring'),

  create: (data: {
    name: string;
    amount: number;
    description?: string;
    dayOfMonth: number;
    frequency: string;
    categoryId: number;
    startDate: string;
    endDate?: string;
  }) => api.post('/recurring', data),

  update: (
    id: number,
    data: {
      name: string;
      amount: number;
      description?: string;
      dayOfMonth: number;
      frequency: string;
      categoryId: number;
      startDate: string;
      endDate?: string;
    }
  ) => api.put(`/recurring/${id}`, data),

  delete: (id: number) => api.delete(`/recurring/${id}`),

  toggleActive: (id: number) => api.patch(`/recurring/${id}/toggle`),
};

// ─── Budget Goals ──────────────────────────────────────────

export const budgetApi = {
  list: () => api.get('/budgets'),

  listForMonth: (yearMonth: string) => api.get(`/budgets/${yearMonth}`),

  createOrUpdate: (data: {
    categoryId: number;
    budgetAmount: number;
    yearMonth?: string;
    active?: boolean;
  }) => api.post('/budgets', data),

  delete: (id: number) => api.delete(`/budgets/${id}`),
};

export default api;
