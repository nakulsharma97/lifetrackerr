import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '../lib/auth';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Valid JWT token parts
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
});

describe('storage.getToken / setToken / removeToken', () => {
  it('returns null when no token is stored', () => {
    expect(storage.getToken()).toBeNull();
  });

  it('returns the stored token after setting', () => {
    const token = createToken(3600);
    storage.setToken(token);
    expect(storage.getToken()).toBe(token);
  });

  it('removes the token after removeToken', () => {
    storage.setToken(createToken(3600));
    storage.removeToken();
    expect(storage.getToken()).toBeNull();
  });
});

describe('storage.getUser / setUser / removeUser', () => {
  const testUser = { userId: 1, username: 'test', email: 'test@test.com', token: 'abc' };

  it('returns null when no user is stored', () => {
    expect(storage.getUser()).toBeNull();
  });

  it('returns the stored user after setting', () => {
    storage.setUser(testUser);
    expect(storage.getUser()).toEqual(testUser);
  });

  it('removes the user after removeUser', () => {
    storage.setUser(testUser);
    storage.removeUser();
    expect(storage.getUser()).toBeNull();
  });
});

describe('storage.clear', () => {
  it('removes both token and user', () => {
    storage.setToken(createToken(3600));
    storage.setUser({ userId: 1, username: 'test', email: 'test@test.com', token: 'abc' });
    storage.clear();
    expect(storage.getToken()).toBeNull();
    expect(storage.getUser()).toBeNull();
  });
});

describe('storage.isAuthenticated', () => {
  it('returns false when no token exists', () => {
    expect(storage.isAuthenticated()).toBe(false);
  });

  it('returns true for a valid non-expired token', () => {
    const token = createToken(3600); // expires in 1 hour
    localStorage.setItem(TOKEN_KEY, token);
    expect(storage.isAuthenticated()).toBe(true);
  });

  it('returns false for an expired token', () => {
    const token = createToken(-3600); // expired 1 hour ago
    localStorage.setItem(TOKEN_KEY, token);
    expect(storage.isAuthenticated()).toBe(false);
  });

  it('returns false for a malformed token (no payload)', () => {
    localStorage.setItem(TOKEN_KEY, 'invalid-token');
    expect(storage.isAuthenticated()).toBe(false);
  });

  it('returns false for a token with only one part', () => {
    localStorage.setItem(TOKEN_KEY, 'header-only');
    expect(storage.isAuthenticated()).toBe(false);
  });

  it('returns false for non-JSON payload', () => {
    localStorage.setItem(TOKEN_KEY, 'header.not-json.signature');
    expect(storage.isAuthenticated()).toBe(false);
  });
});
