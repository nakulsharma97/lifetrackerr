import { useState, useEffect } from 'react';
import { DollarSign, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { expenseApi, habitApi } from '../lib/api';
import type { ExpenseSummaryResponse, HabitResponse, MonthlyTrendItem } from '../types';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const PIE_COLORS = [
  '#171717',
  '#525252',
  '#a3a3a3',
  '#d4d4d4',
  '#475569',
  '#64748b',
  '#94a3b8',
  '#cbd5e1',
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [trend, setTrend] = useState<MonthlyTrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      expenseApi.summary(),
      habitApi.list(),
      expenseApi.monthlyTrend(6),
    ])
      .then(([summaryRes, habitsRes, trendRes]) => {
        setSummary(summaryRes.data);
        setHabits(habitsRes.data);
        setTrend(trendRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-ink-lighter">Loading…</p>
        </div>
      </div>
    );
  }

  const trendTotal = trend.reduce((sum, m) => sum + m.total, 0);
  const avgMonthly = trend.length > 0 ? trendTotal / trend.length : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="heading-xl">Dashboard</h1>
          <p className="body-sm mt-1">Your overview at a glance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
        <div className="card-minimal p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="stat-label">Spent This Month</span>
            <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center dark:bg-surface-800">
              <DollarSign className="w-4 h-4 text-ink dark:text-surface-100" />
            </div>
          </div>
          <p className="stat-value">${summary?.totalAmount.toFixed(2) || '0.00'}</p>
          <p className="caption mt-1">{summary?.transactionCount || 0} transactions</p>
        </div>

        <div className="card-minimal p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="stat-label">Active Habits</span>
            <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center dark:bg-surface-800">
              <Target className="w-4 h-4 text-ink dark:text-surface-100" />
            </div>
          </div>
          <p className="stat-value">{habits.length}</p>
          <p className="caption mt-1">habits being tracked</p>
        </div>

        <div className="card-minimal p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="stat-label">Categories Used</span>
            <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center dark:bg-surface-800">
              <TrendingUp className="w-4 h-4 text-ink dark:text-surface-100" />
            </div>
          </div>
          <p className="stat-value">{summary?.breakdown.length || 0}</p>
          <p className="caption mt-1">expense categories</p>
        </div>

        <div className="card-minimal p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="stat-label">Avg Monthly</span>
            <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center dark:bg-surface-800">
              <BarChart3 className="w-4 h-4 text-ink dark:text-surface-100" />
            </div>
          </div>
          <p className="stat-value">${avgMonthly.toFixed(0)}</p>
          <p className="caption mt-1">last 6 months</p>
        </div>
      </div>

      {/* Today's Habits */}
      {habits.length > 0 && (
        <div className="card-minimal p-6 mb-8">
          <h2 className="heading-sm mb-5">Today's Habits</h2>
          <div className="space-y-3">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0 dark:border-surface-800">
                <span className="text-sm text-ink dark:text-surface-100">{habit.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-lighter">🔥 {habit.currentStreak} day streak</span>
                  <span className="text-xs text-success">✓ {habit.totalCompletions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trend — Line Chart */}
      {trend.length > 0 && (
        <div className="card-minimal p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-ink dark:text-surface-100" />
              <h2 className="heading-sm">Monthly Trend</h2>
            </div>
            <span className="text-xs text-ink-lighter">Last {trend.length} months</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trend.map((m) => ({ label: m.month, total: m.total, full: m.label }))}
                margin={{ top: 4, right: 12, bottom: 0, left: -12 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#737373' }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#737373' }}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
                  labelFormatter={(label: string, payload: any[]) =>
                    payload[0]?.payload?.full || label
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#171717"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#171717', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#171717', stroke: '#fff', strokeWidth: 2 }}
                  animationBegin={100}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-surface-100 dark:border-surface-800">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-ink-lighter">Highest</p>
              <p className="text-sm font-semibold text-ink dark:text-surface-100 mt-0.5">
                ${Math.max(...trend.map((m) => m.total)).toFixed(0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-ink-lighter">Lowest</p>
              <p className="text-sm font-semibold text-ink dark:text-surface-100 mt-0.5">
                ${Math.min(...trend.map((m) => m.total)).toFixed(0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-ink-lighter">Average</p>
              <p className="text-sm font-semibold text-ink dark:text-surface-100 mt-0.5">
                ${avgMonthly.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expense Breakdown — Pie Chart */}
      <div className="card-minimal p-6">
        <h2 className="heading-sm mb-5">Expense Breakdown</h2>
        {summary?.breakdown && summary.breakdown.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.breakdown.map((item) => ({
                      name: item.categoryName,
                      value: item.total,
                    }))}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={3} dataKey="value" strokeWidth={0}
                    animationBegin={100} animationDuration={600}
                  >
                    {summary.breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontSize: '13px' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                  <Legend
                    verticalAlign="middle" align="right" layout="vertical"
                    iconType="circle" iconSize={8}
                    formatter={(value: string) => (<span className="text-sm text-ink-light">{value}</span>)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-3">
              {summary.breakdown.map((item, index) => (
                <div key={item.categoryId} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0 dark:border-surface-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="text-sm text-ink dark:text-surface-100">{item.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink dark:text-surface-100">${item.total.toFixed(2)}</p>
                    <p className="text-xs text-ink-lighter">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-ink-lighter">No expenses this month yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
