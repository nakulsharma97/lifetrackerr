import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle,
  DollarSign,
  Target,
  TrendingUp,
  Moon,
  Sparkles,
  Flame,
} from 'lucide-react';

// ─── Feature Data ──────────────────────────────────────────

const features = [
  {
    icon: DollarSign,
    title: 'Track Expenses',
    description:
      'Log every transaction with categories, dates, and descriptions. Filter by date range and category to find exactly what you need.',
    color: 'from-ink/5 to-ink/10',
  },
  {
    icon: Target,
    title: 'Build Habits',
    description:
      'Create daily habits and track your streaks. A visual 7-day grid makes it easy to see your progress at a glance.',
    color: 'from-ink/5 to-ink/10',
  },
  {
    icon: BarChart3,
    title: 'Visual Insights',
    description:
      'Beautiful pie charts show your spending breakdown by category. Watch your habits grow with streak counters.',
    color: 'from-ink/5 to-ink/10',
  },
  {
    icon: TrendingUp,
    title: 'Stay Consistent',
    description:
      'Daily check-ins keep you accountable. The streak system 🔥 rewards consistency and helps you build lasting routines.',
    color: 'from-ink/5 to-ink/10',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    description:
      'A polished dark theme that\'s easy on the eyes. Toggle between light and dark with a single click.',
    color: 'from-ink/5 to-ink/10',
  },
  {
    icon: Sparkles,
    title: 'Clean Design',
    description:
      'Every pixel is intentional. A minimal, typography-focused interface that puts your data front and center.',
    color: 'from-ink/5 to-ink/10',
  },
];

const stats = [
  { label: 'Expenses Tracked', value: 'Unlimited' },
  { label: 'Habit Streaks', value: '365+ Days' },
  { label: 'Categories', value: 'Custom' },
  { label: 'Data Export', value: 'CSV' },
];

// ─── Fade-in observer hook ─────────────────────────────────

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible] as const;
}

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Landing Page ──────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      {/* ─── Nav Bar ──────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-100 dark:bg-surface-950/80 dark:border-surface-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center dark:bg-surface-100">
              <Activity className="w-4 h-4 text-white dark:text-surface-950" />
            </div>
            <span className="text-lg font-medium tracking-tight text-ink dark:text-surface-100">
              LifeTracker
            </span>
          </div>

          <nav className="hidden sm:flex items-center gap-8">
            <a href="#features" className="text-sm text-ink-light hover:text-ink transition-colors dark:text-surface-300 dark:hover:text-surface-100">
              Features
            </a>
            <a href="#about" className="text-sm text-ink-light hover:text-ink transition-colors dark:text-surface-300 dark:hover:text-surface-100">
              About
            </a>
            <Link
              to="/auth/login"
              className="text-sm text-ink-light hover:text-ink transition-colors dark:text-surface-300 dark:hover:text-surface-100"
            >
              Sign in
            </Link>
            <Link
              to="/auth/register"
              className="btn-primary text-sm !py-2 !px-4"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>

          {/* Mobile nav buttons */}
          <div className="sm:hidden flex items-center gap-3">
            <Link
              to="/auth/login"
              className="text-sm text-ink-light hover:text-ink transition-colors dark:text-surface-300"
            >
              Sign in
            </Link>
            <Link
              to="/auth/register"
              className="btn-primary text-sm !py-1.5 !px-3"
            >
              Start
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-surface-100/30 to-transparent rounded-full dark:from-surface-800/20" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <FadeSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-100 border border-surface-200 text-xs font-medium text-ink-lighter mb-8 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-400">
              <Sparkles className="w-3.5 h-3.5" />
              Your life, tracked beautifully
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-ink leading-[1.1] dark:text-surface-100">
              Track your{' '}
              <span className="relative inline-block">
                <span className="relative z-10">expenses</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-ink/5 rounded dark:bg-surface-100/10" />
              </span>
              {' '}&amp;{' '}
              <span className="relative inline-block">
                <span className="relative z-10">habits</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-ink/5 rounded dark:bg-surface-100/10" />
              </span>
              <br />
              in one place.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-ink-light leading-relaxed max-w-2xl mx-auto dark:text-surface-300">
              A clean, minimal dashboard for managing your personal finances
              and building daily routines. No clutter. No distractions.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth/register"
                className="btn-primary text-base !py-3 !px-8 w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth/login"
                className="btn-secondary text-base !py-3 !px-8 w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>

            {/* Demo hint */}
            <p className="mt-6 text-xs text-ink-lighter">
              Demo account: <span className="font-mono text-ink-light dark:text-surface-300">demo</span> / <span className="font-mono text-ink-light dark:text-surface-300">demo123</span>
            </p>

            {/* Stats row */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-light text-ink dark:text-surface-100">{stat.value}</p>
                  <p className="text-xs text-ink-lighter mt-1 dark:text-surface-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ─── Product Preview ──────────────────────────────── */}
      <FadeSection>
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="relative rounded-2xl border border-surface-200 overflow-hidden shadow-xl dark:border-surface-800">
            {/* Mock browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-100 border-b border-surface-200 dark:bg-surface-800 dark:border-surface-700">
              <div className="w-3 h-3 rounded-full bg-surface-300 dark:bg-surface-600" />
              <div className="w-3 h-3 rounded-full bg-surface-300 dark:bg-surface-600" />
              <div className="w-3 h-3 rounded-full bg-surface-300 dark:bg-surface-600" />
              <div className="flex-1 max-w-md mx-auto">
                <div className="h-7 rounded-md bg-white border border-surface-200 flex items-center px-3 dark:bg-surface-900 dark:border-surface-700">
                  <span className="text-xs text-ink-lighter">app.lifetracker.app/dashboard</span>
                </div>
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="bg-white p-6 space-y-4 dark:bg-surface-900">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-5 w-28 bg-surface-200 rounded dark:bg-surface-700" />
                  <div className="h-3 w-40 bg-surface-100 rounded dark:bg-surface-800" />
                </div>
                <div className="h-8 w-24 bg-ink rounded-lg dark:bg-surface-100" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[80, 65, 45].map((w, i) => (
                  <div key={i} className="h-24 rounded-lg bg-surface-50 border border-surface-100 p-4 dark:bg-surface-800 dark:border-surface-700">
                    <div className="h-3 w-16 bg-surface-200 rounded mb-3 dark:bg-surface-700" />
                    <div className={`h-6 w-${w > 60 ? '20' : '16'} bg-surface-300 rounded dark:bg-surface-600`} />
                    <div className="h-2 w-12 bg-surface-200 rounded mt-2 dark:bg-surface-700" />
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <div className="flex-1 h-40 rounded-lg bg-surface-50 border border-surface-100 p-4 dark:bg-surface-800 dark:border-surface-700">
                  <div className="h-3 w-24 bg-surface-200 rounded mb-4 dark:bg-surface-700" />
                  {/* Mini pie chart mock */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-4 border-surface-300 dark:border-surface-600" />
                    <div className="space-y-2 flex-1">
                      {[70, 50, 30].map((p, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-surface-300 dark:bg-surface-600" />
                          <div className={`h-2 bg-surface-200 rounded flex-1 dark:bg-surface-700`} style={{ width: `${p}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1 h-40 rounded-lg bg-surface-50 border border-surface-100 p-4 dark:bg-surface-800 dark:border-surface-700">
                  <div className="h-3 w-20 bg-surface-200 rounded mb-4 dark:bg-surface-700" />
                  <div className="flex gap-1.5 justify-center mt-2">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div key={j} className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full ${j < 4 ? 'bg-success/70' : j === 4 ? 'bg-success/30' : 'bg-surface-200 dark:bg-surface-700'}`} />
                        <div className="h-2 w-4 bg-surface-200 rounded dark:bg-surface-700" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ─── Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-ink dark:text-surface-100">
                Everything you need to stay on track
              </h2>
              <p className="mt-4 text-lg text-ink-light max-w-xl mx-auto dark:text-surface-300">
                Simple tools for tracking what matters. No fluff, no complexity.
              </p>
            </div>
          </FadeSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-surface-200 rounded-2xl overflow-hidden dark:bg-surface-800">
            {features.map((feature, index) => (
              <FadeSection key={feature.title}>
                <div className="bg-white p-8 h-full dark:bg-surface-900">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center mb-5 dark:bg-surface-800">
                    <feature.icon className="w-5 h-5 text-ink dark:text-surface-100" />
                  </div>
                  <h3 className="text-base font-medium text-ink mb-2 dark:text-surface-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-ink-light leading-relaxed dark:text-surface-300">
                    {feature.description}
                  </p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits Strip ────────────────────────────────── */}
      <section className="py-16 px-6 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-4xl mx-auto">
          <FadeSection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { icon: CheckCircle, title: '100% Free', desc: 'No subscription. No hidden costs.' },
                { icon: Flame, title: 'Streak Motivation', desc: 'Gamified habit tracking keeps you going.' },
                { icon: DollarSign, title: 'Smart Budgeting', desc: 'Know where every dollar goes.' },
              ].map((item) => (
                <div key={item.title} className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center mx-auto dark:bg-surface-100/5">
                    <item.icon className="w-5 h-5 text-ink dark:text-surface-100" />
                  </div>
                  <h3 className="text-sm font-medium text-ink dark:text-surface-100">{item.title}</h3>
                  <p className="text-sm text-ink-lighter dark:text-surface-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeSection>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-ink dark:text-surface-100">
              Ready to take control?
            </h2>
            <p className="mt-4 text-lg text-ink-light max-w-lg mx-auto dark:text-surface-300">
              Start tracking your expenses and habits today. It's free, it's simple, and it works.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth/register"
                className="btn-primary text-base !py-3 !px-8 w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth/login"
                className="btn-secondary text-base !py-3 !px-8 w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-surface-100 dark:border-surface-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-ink-lighter">
            <Activity className="w-4 h-4" />
            LifeTracker
          </div>
          <p className="text-xs text-ink-lighter">
            Built with React + Spring Boot. Open source on{' '}
            <a
              href="https://github.com/nakulsharma97/lifetrackerr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink transition-colors"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
