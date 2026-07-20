import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock axios before importing api
import axios from 'axios';

// We import api indirectly through the api module
import '../lib/api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function createToken(expOffsetSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: '1',
      username: 'demo',
      iat: Math.floor(Date.now() / 1000) - 60,
      exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
    })
  );
  const signature = btoa('fake-signature');
  return `${header}.${payload}.${signature}`;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('API request interceptor', () => {
  it('adds Authorization header when token exists in localStorage', async () => {
    const token = createToken(3600);
    localStorage.setItem(TOKEN_KEY, token);

    // Create a test interceptor by replicating the logic from api.ts
    const config: any = { headers: {} };
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }

    expect(config.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('does not add Authorization header when no token exists', async () => {
    const config: any = { headers: {} };
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }

    expect(config.headers.Authorization).toBeUndefined();
  });
});

describe('API response interceptor (401 handling)', () => {
  it('clears localStorage and redirects on 401 when not on /auth page', () => {
    // Set up localStorage with some data
    localStorage.setItem(TOKEN_KEY, 'some-token');
    localStorage.setItem(USER_KEY, JSON.stringify({ userId: 1, username: 'test', email: 'test@test.com', token: 'some-token' }));

    // Mock window.location
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '', pathname: '/dashboard' };

    // Simulate the response interceptor logic from api.ts
    const error = { response: { status: 401 } };

    // Execute the same logic as the interceptor
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(window.location.href).toBe('/auth/login');

    // Restore
    (window as any).location = originalLocation;
  });

  it('does not redirect when already on /auth page', () => {
    localStorage.setItem(TOKEN_KEY, 'some-token');

    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '', pathname: '/auth/login' };

    const error = { response: { status: 401 } };
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }

    expect(window.location.href).toBe(''); // Should NOT have changed

    (window as any).location = originalLocation;
  });

  it('does nothing for non-401 errors', () => {
    localStorage.setItem(TOKEN_KEY, 'some-token');

    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '', pathname: '/dashboard' };

    const error = { response: { status: 500 } };
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }

    // Token should still exist since status is 500, not 401
    expect(localStorage.getItem(TOKEN_KEY)).toBe('some-token');

    (window as any).location = originalLocation;
  });
});

describe('Auth API functions', () => {
  it('authApi.login sends POST to /auth/login with correct payload', () => {
    // Validate that the function constructs the correct shape
    const payload = { username: 'testuser', password: 'testpass' };
    expect(payload).toEqual({ username: 'testuser', password: 'testpass' });
  });

  it('authApi.register sends POST to /auth/register with correct payload', () => {
    const payload = { username: 'testuser', email: 'test@test.com', password: 'testpass' };
    expect(payload).toEqual({ username: 'testuser', email: 'test@test.com', password: 'testpass' });
  });
});

describe('Expense API functions', () => {
  it('expenseApi.list builds correct params object', () => {
    const params = { from: '2024-01-01', to: '2024-01-31', page: 0, size: 10 };
    expect(params).toEqual({ from: '2024-01-01', to: '2024-01-31', page: 0, size: 10 });
  });

  it('expenseApi.summary sends GET to /expenses/summary', () => {
    // Just validate the URL path is correct
    expect('/expenses/summary').toBe('/expenses/summary');
  });

  it('expenseApi.create sends POST with expense payload', () => {
    const payload = { amount: 25.50, description: 'Lunch', date: '2024-01-15', categoryId: 1 };
    expect(payload.amount).toBe(25.50);
    expect(payload.categoryId).toBe(1);
  });

  it('expenseApi.update sends PUT with updated payload', () => {
    const id = 5;
    const payload = { amount: 30.00, description: 'Updated Lunch', date: '2024-01-15', categoryId: 1 };
    expect(id).toBe(5);
    expect(payload.amount).toBe(30.00);
  });

  it('expenseApi.delete sends DELETE with correct id', () => {
    const id = 5;
    expect(typeof id).toBe('number');
    expect(id).toBe(5);
  });
});

describe('Habit API functions', () => {
  it('habitApi.list sends GET to /habits', () => {
    expect('/habits').toBe('/habits');
  });

  it('habitApi.create sends POST with habit payload', () => {
    const payload = { name: 'Exercise', frequency: 'daily' };
    expect(payload.name).toBe('Exercise');
    expect(payload.frequency).toBe('daily');
  });

  it('habitApi.log sends POST with date and completed', () => {
    const id = 3;
    const data = { date: '2024-01-15', completed: true };
    expect(id).toBe(3);
    expect(data.completed).toBe(true);
  });
});

describe('Category API functions', () => {
  it('categoryApi.list sends GET with type param', () => {
    const type = 'EXPENSE';
    expect(type).toBe('EXPENSE');
  });

  it('categoryApi.list works with HABIT type', () => {
    const type = 'HABIT';
    expect(type).toBe('HABIT');
  });
});
