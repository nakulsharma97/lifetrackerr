import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { storage } from '../lib/auth';
import { Activity, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-surface-50 via-white to-surface-100 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-ink/3 to-transparent dark:from-surface-100/5 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-ink/3 to-transparent dark:from-surface-100/5 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-56 h-56 rounded-full bg-gradient-to-br from-ink/2 to-transparent dark:from-surface-100/3 animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      <div className="w-full max-w-sm px-4 animate-slide-up relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-ink to-ink-dark shadow-lg shadow-ink/20 mb-5 animate-scale-in">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="heading-lg">Create account</h1>
          <p className="body-sm mt-1.5 text-ink-lighter">Start tracking your expenses, habits, and routines</p>
        </div>

        <div className="card-glass p-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-sm text-red-700 animate-slide-down dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink-light mb-1.5">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-glass" placeholder="3-50 characters" required minLength={3} autoFocus />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-light mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-light mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-glass" placeholder="6+ characters" required minLength={6} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full group mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </button>

            <p className="text-center text-sm text-ink-lighter pt-1">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-ink font-medium underline underline-offset-2 hover:text-ink-dark transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
