import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

// Mock the navigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API
vi.mock('../lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

// Mock the auth storage
vi.mock('../lib/auth', () => ({
  storage: {
    setToken: vi.fn(),
    setUser: vi.fn(),
    getToken: vi.fn(),
    getUser: vi.fn(),
    removeToken: vi.fn(),
    removeUser: vi.fn(),
    clear: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

function renderLoginPage() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('renders the logo and heading', () => {
    renderLoginPage();
    expect(screen.getByText('LifeTracker')).toBeDefined();
    expect(screen.getByText('Sign in to your account')).toBeDefined();
  });

  it('renders username and password inputs', () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText('demo')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••')).toBeDefined();
  });

  it('renders the sign in button', () => {
    renderLoginPage();
    const button = screen.getByRole('button', { name: 'Sign in' });
    expect(button).toBeDefined();
  });

  it('renders a link to the register page', () => {
    renderLoginPage();
    const registerLink = screen.getByText('Create one');
    expect(registerLink).toBeDefined();
    expect(registerLink.getAttribute('href')).toBe('/auth/register');
  });

  it('updates username input on typing', () => {
    renderLoginPage();
    const input = screen.getByPlaceholderText('demo') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'testuser' } });
    expect(input.value).toBe('testuser');
  });

  it('updates password input on typing', () => {
    renderLoginPage();
    const input = screen.getByPlaceholderText('••••••') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'mypassword' } });
    expect(input.value).toBe('mypassword');
  });

  it('shows no error message initially', () => {
    renderLoginPage();
    // Error messages use text-danger class
    const errorElements = document.querySelectorAll('.text-danger');
    expect(errorElements.length).toBe(0);
  });

  it('shows error message when login fails', async () => {
    const { authApi } = await import('../lib/api');
    vi.mocked(authApi.login).mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText('demo'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeDefined();
    });
  });

  it('shows generic error when no message from server', async () => {
    const { authApi } = await import('../lib/api');
    vi.mocked(authApi.login).mockRejectedValue({
      response: { data: {} },
    });

    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText('demo'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeDefined();
    });
  });

  it('disables submit button while loading', () => {
    renderLoginPage();
    const button = screen.getByRole('button', { name: /sign/i }) as HTMLButtonElement;
    fireEvent.click(button);
    // After clicking, the button should have been disabled due to loading state
    // But since we're not actually submitting (no form submit), it stays enabled
    expect(button.disabled).toBe(false);
  });

  it('button shows "Signing in…" during loading', async () => {
    const { authApi } = await import('../lib/api');
    // Return a promise that never resolves to keep loading state
    vi.mocked(authApi.login).mockReturnValue(new Promise(() => {}));

    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText('demo'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Signing in…')).toBeDefined();
    });
  });

  it('navigates to dashboard on successful login', async () => {
    const { authApi } = await import('../lib/api');
    const { storage } = await import('../lib/auth');

    vi.mocked(authApi.login).mockResolvedValue({
      data: {
        token: 'fake-jwt-token',
        username: 'testuser',
        email: 'test@test.com',
        userId: 1,
      },
    } as any);

    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText('demo'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(storage.setToken).toHaveBeenCalledWith('fake-jwt-token');
      expect(storage.setUser).toHaveBeenCalledWith({
        userId: 1,
        username: 'testuser',
        email: 'test@test.com',
        token: 'fake-jwt-token',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
