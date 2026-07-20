import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import * as auth from '../lib/auth';
import * as theme from '../lib/useTheme';

// Mock the auth storage module
vi.mock('../lib/auth', () => ({
  storage: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    removeToken: vi.fn(),
    getUser: vi.fn(),
    setUser: vi.fn(),
    removeUser: vi.fn(),
    clear: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

// Mock the theme hook
const mockToggle = vi.fn();
vi.mock('../lib/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    toggle: mockToggle,
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderSidebar() {
  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Sidebar', () => {
  it('renders the logo and app name', () => {
    renderSidebar();
    expect(screen.getByText('LifeTracker')).toBeDefined();
  });

  it('renders all navigation links', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Expenses')).toBeDefined();
    expect(screen.getByText('Habits')).toBeDefined();
  });

  it('navigation links have correct hrefs', () => {
    renderSidebar();
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const expensesLink = screen.getByText('Expenses').closest('a');
    const habitsLink = screen.getByText('Habits').closest('a');

    expect(dashboardLink?.getAttribute('href')).toBe('/dashboard');
    expect(expensesLink?.getAttribute('href')).toBe('/expenses');
    expect(habitsLink?.getAttribute('href')).toBe('/habits');
  });

  it('shows dark mode toggle button', () => {
    renderSidebar();
    expect(screen.getByText('Dark Mode')).toBeDefined();
  });

  it('calls toggle when dark mode button is clicked', () => {
    renderSidebar();
    fireEvent.click(screen.getByText('Dark Mode'));
    expect(mockToggle).toHaveBeenCalledOnce();
  });

  it('shows "User" and empty email when no user is logged in', () => {
    vi.mocked(auth.storage.getUser).mockReturnValue(null);
    renderSidebar();
    expect(screen.getByText('User')).toBeDefined();
  });

  it('shows username and email when user is logged in', () => {
    vi.mocked(auth.storage.getUser).mockReturnValue({
      userId: 1,
      username: 'testuser',
      email: 'test@test.com',
      token: 'abc',
    });
    renderSidebar();
    expect(screen.getByText('testuser')).toBeDefined();
    expect(screen.getByText('test@test.com')).toBeDefined();
  });

  it('shows the first letter of username in avatar', () => {
    vi.mocked(auth.storage.getUser).mockReturnValue({
      userId: 1,
      username: 'Alice',
      email: 'alice@test.com',
      token: 'abc',
    });
    renderSidebar();
    expect(screen.getByText('A')).toBeDefined();
  });

  it('shows "?" in avatar when no username', () => {
    vi.mocked(auth.storage.getUser).mockReturnValue(null);
    renderSidebar();
    expect(screen.getByText('?')).toBeDefined();
  });

  it('renders a logout button', () => {
    renderSidebar();
    const logoutBtn = screen.getByTitle('Log out');
    expect(logoutBtn).toBeDefined();
  });
});
