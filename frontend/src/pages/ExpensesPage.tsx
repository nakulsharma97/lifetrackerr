import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, PieChart as PieChartIcon, RotateCcw, Loader2 } from 'lucide-react';
import { expenseApi, categoryApi } from '../lib/api';
import type { ExpenseResponse, CategoryResponse, ExpenseSummaryResponse } from '../types';
import { format, startOfMonth } from 'date-fns';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [summary, setSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // ─── Filters ──────────────────────────────────────────────
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');

  const fetchData = useCallback(async () => {
    try {
      const params: Record<string, string> = {
        from: dateFrom,
        to: dateTo,
      };
      if (filterCategoryId !== '') {
        params.categoryId = String(filterCategoryId);
      }

      const [expRes, catRes, summaryRes] = await Promise.all([
        expenseApi.list(params),
        categoryApi.list('EXPENSE'),
        expenseApi.summary(),
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, filterCategoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetFilters = () => {
    setDateFrom(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
    setFilterCategoryId('');
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCategoryId('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        description: description || undefined,
        date,
        categoryId: Number(categoryId),
      };

      if (editingId) {
        await expenseApi.update(editingId, payload);
      } else {
        await expenseApi.create(payload);
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense: ExpenseResponse) => {
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setDate(expense.date);
    setCategoryId(expense.categoryId);
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseApi.delete(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

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
          <h1 className="heading-xl">Expenses</h1>
          <p className="body-sm mt-1">Track your spending</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel' : 'Add Expense'}</span>
        </button>
      </div>

      {/* ─── Filter Bar ────────────────────────────────────── */}
      <div className="card-minimal p-4 mb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-lighter">
            Filters
          </span>

          {/* From date */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-lighter">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-minimal w-auto text-sm py-1.5 px-3"
            />
          </div>

          {/* To date */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-lighter">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-minimal w-auto text-sm py-1.5 px-3"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-lighter">Category</label>
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : '')}
              className="input-minimal w-auto text-sm py-1.5 px-3 pr-8"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="btn-ghost p-1.5 ml-auto"
            title="Reset filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-minimal p-6 mb-8 animate-slide-up">
          <h2 className="heading-sm mb-5">
            {editingId ? 'Edit Expense' : 'New Expense'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-minimal"
                placeholder="0.00"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-minimal"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="input-minimal"
                required
                disabled={submitting}
              >
                <option value="">Select…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-minimal"
                placeholder="Coffee, lunch…"
                disabled={submitting}
              />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="btn-secondary" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  editingId ? 'Update' : 'Add'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary + Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Pie Chart */}
        <div className="card-minimal p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-ink-lighter" />
            <h2 className="heading-sm !text-xs !tracking-wider !font-medium !uppercase !text-ink-lighter">
              This Month
            </h2>
          </div>
          {summary && summary.breakdown.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.breakdown.map((item) => ({
                      name: item.categoryName,
                      value: item.total,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                    animationBegin={100}
                    animationDuration={600}
                  >
                    {summary.breakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <p className="text-xs text-ink-lighter">No data yet</p>
            </div>
          )}
        </div>

        {/* Category breakdown list */}
        <div className="card-minimal p-5 lg:col-span-2">
          <h2 className="heading-sm mb-4">Category Breakdown</h2>
          {summary && summary.breakdown.length > 0 ? (
            <div className="space-y-2">
              {summary.breakdown.map((item, index) => (
                <div
                  key={item.categoryId}
                  className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        PIE_COLORS[index % PIE_COLORS.length],
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink">
                        {item.categoryName}
                      </span>
                      <span className="text-sm font-medium text-ink font-mono">
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(item.percentage, 2)}%`,
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-ink-lighter">
                      {item.percentage}% of total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-ink-lighter">
                No expenses this month yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card-minimal overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-ink-lighter">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-minimal">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="text-ink-lighter font-mono text-xs">
                      {expense.date}
                    </td>
                    <td className="text-ink">{expense.description || '—'}</td>
                    <td>
                      <span className="chip">{expense.categoryName}</span>
                    </td>
                    <td className="text-right font-mono font-medium">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="btn-ghost p-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="btn-ghost p-1.5 text-ink-lighter hover:text-danger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
