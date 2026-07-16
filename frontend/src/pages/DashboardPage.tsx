import { useState, useEffect } from 'react';
import { DollarSign, Target, TrendingUp, BarChart3, AlertTriangle, PiggyBank, Activity, Sparkles } from 'lucide-react';
import { expenseApi, habitApi, budgetApi } from '../lib/api';
import type { ExpenseSummaryResponse, HabitResponse, MonthlyTrendItem, BudgetGoalResponse } from '../types';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const PIE_COLORS = ['#171717', '#525252', '#a3a3a3', '#d4d4d4', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

export default function DashboardPage() {
  const [summary, setSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [trend, setTrend] = useState<MonthlyTrendItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetGoalResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([expenseApi.summary(), habitApi.list(), expenseApi.monthlyTrend(6), budgetApi.list()])
      .then(([summaryRes, habitsRes, trendRes, budgetRes]) => {
        setSummary(summaryRes.data);
        setHabits(habitsRes.data);
        setTrend(trendRes.data);
        setBudgets(budgetRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          {[1,2,3,4].map(i => <div key={i} className="card-minimal p-6"><div className="skeleton h-24" /></div>)}
        </div>
        <div className="skeleton h-64 mb-8" />
        <div className="skeleton h-80" />
      </div>
    );
  }

  const avgMonthly = trend.length > 0 ? trend.reduce((s, m) => s + m.total, 0) / trend.length : 0;
  const exceededBudgets = budgets.filter(b => b.exceeded);

  const summaryCards = [
    { label: 'Spent This Month', value: `$${summary?.totalAmount.toFixed(2) || '0.00'}`, sub: `${summary?.transactionCount || 0} transactions`, icon: DollarSign },
    { label: 'Active Habits', value: habits.length, sub: 'habits being tracked', icon: Target },
    { label: 'Categories', value: summary?.breakdown.length || 0, sub: 'expense categories', icon: TrendingUp },
    { label: 'Avg Monthly', value: `$${avgMonthly.toFixed(0)}`, sub: 'last 6 months', icon: BarChart3 },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-xl flex items-center gap-3">
            Dashboard
            <span className="text-xs font-normal text-ink-lighter bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-full">Overview</span>
          </h1>
          <p className="body-sm mt-1 text-ink-lighter">Your financial snapshot at a glance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10 stagger-children">
        {summaryCards.map((card, i) => (
          <div key={i} className="card-glass-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="stat-label">{card.label}</span>
              <div className="w-10 h-10 rounded-xl bg-ink/5 dark:bg-surface-100/5 flex items-center justify-center">
                <card.icon className="w-4 h-4 text-ink dark:text-surface-100" />
              </div>
            </div>
            <p className="stat-value">{card.value}</p>
            <p className="caption mt-1.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Budget Alerts */}
      {exceededBudgets.length > 0 && (
        <div className="card-glass p-5 mb-8 border-l-4 border-l-danger animate-slide-down">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <h2 className="heading-sm !text-danger">Budget Exceeded</h2>
          </div>
          <div className="space-y-2">
            {exceededBudgets.map(bg => (
              <div key={bg.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-ink">{bg.categoryName}</span>
                <span className="font-medium text-danger font-mono">${bg.spentAmount.toFixed(2)} / ${bg.budgetAmount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Goals */}
      {budgets.length > 0 && (
        <div className="card-glass p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <PiggyBank className="w-4 h-4 text-ink dark:text-surface-100" />
            <h2 className="heading-sm">Monthly Budgets</h2>
          </div>
          <div className="space-y-4">
            {budgets.map(bg => (
              <div key={bg.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-ink">{bg.categoryName}</span>
                    <span className="text-xs text-ink-lighter">${bg.spentAmount.toFixed(2)} / ${bg.budgetAmount.toFixed(2)}</span>
                  </div>
                  <span className={`text-xs font-medium ${bg.exceeded ? 'text-danger' : 'text-emerald-600'}`}>
                    {bg.spentPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ease-out ${bg.exceeded ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-ink/80 to-ink'}`}
                    style={{ width: `${Math.min(bg.spentPercentage, 100)}%` }} />
                </div>
                <p className={`text-xs mt-1 ${bg.exceeded ? 'text-danger' : 'text-ink-lighter'}`}>
                  {bg.exceeded ? `$${Math.abs(bg.remainingAmount).toFixed(2)} over budget` : `$${bg.remainingAmount.toFixed(2)} remaining`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Habits */}
      {habits.length > 0 && (
        <div className="card-glass p-6 mb-8 stagger-children">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-ink dark:text-surface-100" />
            <h2 className="heading-sm">Today's Habits</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {habits.map((habit) => (
              <div key={habit.id} className="bg-surface-50/50 dark:bg-surface-800/50 rounded-xl p-4 border border-surface-100 dark:border-surface-800 hover:border-ink/20 dark:hover:border-surface-600 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink dark:text-surface-100">{habit.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs flex items-center gap-0.5 text-orange-500"><Activity className="w-3 h-3" />{habit.currentStreak}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">✓{habit.totalCompletions}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-ink-lighter">
                  {habit.currentStreak > 0 && <span className="chip-success">🔥 {habit.currentStreak}d streak</span>}
                  {habit.longestStreak > 0 && <span className="chip">Best: {habit.longestStreak}d</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trend + Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Trend Chart */}
        {trend.length > 0 && (
          <div className="card-glass p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-ink dark:text-surface-100" />
                <h2 className="heading-sm">Monthly Trend</h2>
              </div>
              <span className="text-[10px] text-ink-lighter bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-full">Last {trend.length} months</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.map(m => ({ label: m.month, total: m.total, full: m.label }))} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: '13px' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
                    labelFormatter={(label: string, payload: any[]) => payload[0]?.payload?.full || label} />
                  <Line type="monotone" dataKey="total" stroke="#171717" strokeWidth={2.5} dot={{ r: 4, fill: '#171717', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#171717', stroke: '#fff', strokeWidth: 2 }} animationBegin={100} animationDuration={800} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-surface-200/60 dark:border-surface-800">
              {[
                { label: 'Highest', value: `$${Math.max(...trend.map(m => m.total)).toFixed(0)}` },
                { label: 'Lowest', value: `$${Math.min(...trend.map(m => m.total)).toFixed(0)}` },
                { label: 'Average', value: `$${avgMonthly.toFixed(0)}` },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-ink-lighter">{stat.label}</p>
                  <p className="text-base font-semibold text-ink dark:text-surface-100 mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pie Chart */}
        <div className="card-glass p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-ink dark:text-surface-100" />
            <h2 className="heading-sm">Expense Breakdown</h2>
          </div>
          {summary?.breakdown && summary.breakdown.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={summary.breakdown.map(item => ({ name: item.categoryName, value: item.total }))}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}
                      animationBegin={100} animationDuration={600}>
                      {summary.breakdown.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: '13px' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {summary.breakdown.slice(0, 5).map((item, index) => (
                  <div key={item.categoryId} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-xs text-ink dark:text-surface-100">{item.categoryName}</span>
                    </div>
                    <span className="text-xs font-medium text-ink dark:text-surface-100">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-ink-lighter">No expenses this month yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
