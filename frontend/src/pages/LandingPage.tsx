import { Link } from 'react-router-dom';
import { Activity, DollarSign, Target, TrendingUp, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: 'Track Expenses',
    description: 'Log and categorize every expense. See where your money goes with interactive charts and monthly breakdowns.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Target,
    title: 'Build Habits',
    description: 'Create daily routines and track your streaks. Stay motivated with visual progress and 7-day activity grids.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Monitor Progress',
    description: 'Get a bird\'s-eye view of your finances and habits. Spot trends, celebrate wins, and stay on track.',
    color: 'from-blue-500 to-cyan-500',
  },
];

const stats = [
  { label: 'Expenses Tracked', value: '10,000+' },
  { label: 'Active Users', value: '5,000+' },
  { label: 'Habits Completed', value: '50,000+' },
  { label: 'Avg. Streak', value: '12 days' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ──────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              LifeTracker
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/auth/register"
              className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────── */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600 mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your personal life dashboard</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
            Take control of{' '}
            <span className="bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400 bg-clip-text text-transparent">
              your life
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Track your expenses, build better habits, and see your progress over time.
            Simple, private, and designed for real life.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ───────────────────────────────────────── */}
      <section className="py-16 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────── */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Three core tools to help you understand and improve your daily life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-gray-900 group-hover:gap-2 transition-all">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Three simple steps to start tracking your life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Create an account', desc: 'Sign up in seconds. No credit card needed.' },
              { step: '02', title: 'Add your data', desc: 'Log expenses and create habits you want to build.' },
              { step: '03', title: 'Track progress', desc: 'Watch your spending habits and streaks grow over time.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center mx-auto mb-5 text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Loved by users
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: 'Finally, an app that combines expense tracking with habit building. The streak feature keeps me going.', name: 'Sarah K.', role: 'Freelancer' },
              { quote: 'I\'ve tried dozens of finance trackers. LifeTracker is the only one I\'ve stuck with for more than a month.', name: 'Marcus J.', role: 'Software Engineer' },
              { quote: 'Simple, clean, and effective. The dark mode is a nice touch for late-night planning sessions.', name: 'Priya R.', role: 'Designer' },
            ].map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-gray-100 bg-white">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle key={i} className="w-4 h-4 text-green-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Ready to take control?
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-lg mx-auto">
            Join thousands of users who track their expenses and habits every day.
            It's free, forever.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white border border-gray-700 rounded-xl hover:bg-gray-800 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="py-12 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center">
              <Activity className="w-3 h-3 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-400">LifeTracker</span>
          </div>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} LifeTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
