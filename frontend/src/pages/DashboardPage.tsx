import { useState, useEffect } from 'react';
import { DollarSign, Target, TrendingUp } from 'lucide-react';
import { expenseApi, habitApi } from '../lib/api';
import type { ExpenseSummaryResponse, HabitResponse } from '../types';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const getChartColors = () => {
  if (typeof document === 'undefined') return ['#171717', '#525252', '#a3a3a3', '#d4d4d4', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];
  const root = document.documentElement;
  const style = getComputedStyle(root);
  return [
    style.getPropertyValue('--chart-1').trim() || '#171717',
    style.getPropertyValue('--chart-2').trim() || '#525252',
    style.getPropertyValue('--chart-3').trim() || '#a3a3a3',
    style.getPropertyValue('--chart-4').trim() || '#d4d4d4',
    style.getPropertyValue('--chart-5').trim() || '#475569',
    style.getPropertyValue('--chart-6').trim() || '#64748b',
    style.getPropertyValue('--chart-7').trim() || '#94a3b8',
    style.getPropertyValue('--chart-8').trim() || '#cbd5e1',
  ];
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pieColors, setPieColors] = useState<string[]>(getChartColors());

  useEffect(() => {
    setPieColors(getChartColors());
  }, []);

  useEffect(() => {
    Promise.all([
      expenseApi.summary(),
      habitApi.list(),
    ])
      .then(([summaryRes, habitsRes]) => {
        setSummary(summaryRes.data);
        setHabits(habitsRes.data);
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="heading-xl">Dashboard</h1>
          <p className="body-sm mt-1">Your overview at a glance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="card-minimal p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="stat-label">Spent This Month</span>
            <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-ink" />
            </div>
          </div>
          <p className="stat-value">
            ${summary?.totalAmount.toFixed(2) || '0.00'}
          </p>
          <p className="caption mt-1">
            {summary?.transactionCount || 0} transactions
          </p>
        </div>

        <div className="card-minimal p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="stat-label">Active Habits</span>
            <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center">
              <Target className="w-4 h-4 text-ink" />
            </div>
          </div>
          <p className="stat-value">{habits.length}</p>
          <p className="caption mt-1">habits being tracked</p>
        </div>

        <div className="card-minimal p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="stat-label">Categories Used</span>
            <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-ink" />
            </div>
          </div>
          <p className="stat-value">
            {summary?.breakdown.length || 0}
          </p>
          <p className="caption mt-1">expense categories</p>
        </div>
      </div>

      {/* Today's Habits */}
      {habits.length > 0 && (
        <div className="card-minimal p-6 mb-8">
          <h2 className="heading-sm mb-5">Today's Habits</h2>
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0"
              >
                <span className="text-sm text-ink">{habit.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-lighter">
                    🔥 {habit.currentStreak} day streak
                  </span>
                  <span className="text-xs text-success">
                    ✓ {habit.totalCompletions}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Breakdown — Pie Chart */}
      <div className="card-minimal p-6">
        <h2 className="heading-sm mb-5">Expense Breakdown</h2>
        {summary?.breakdown && summary.breakdown.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.breakdown.map((item) => ({
                      name: item.categoryName,
                      value: item.total,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                    animationBegin={100}
                    animationDuration={600}
                  >
                    {summary.breakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      fontSize: '13px',
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-sm text-ink-light">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Side panel with totals */}
            <div className="flex flex-col justify-center space-y-3">
              {summary.breakdown.map((item, index) => (
                <div
                  key={item.categoryId}
                  className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: pieColors[index % pieColors.length],
                      }}
                    />
                    <span className="text-sm text-ink">
                      {item.categoryName}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink">
                      ${item.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-ink-lighter">
                      {item.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-ink-lighter">
              No expenses this month yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
