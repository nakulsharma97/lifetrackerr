import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { storage } from '../lib/auth';
import { Activity } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.register(username, email, password);
      storage.setToken(data.token);
      storage.setUser({
        userId: data.userId,
        username: data.username,
        email: data.email,
        token: data.token,
      });
      navigate('/dashboard');
    } catch (err: any) {
      const details = err.response?.data?.details;
      setError(
        details
          ? Object.values(details).join(', ')
          : err.response?.data?.message || 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="heading-lg">Create Account</h1>
          <p className="body-sm mt-1">Start tracking your life</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-danger/5 border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-minimal"
              placeholder="3-50 characters"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-minimal"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-minimal"
              placeholder="6+ characters"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-ink-lighter">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-ink underline underline-offset-2 hover:text-ink-dark"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
