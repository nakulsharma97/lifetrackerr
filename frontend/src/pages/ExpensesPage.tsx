import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, PieChart as PieChartIcon, RotateCcw, X, Download, DollarSign } from 'lucide-react';
import { expenseApi, categoryApi } from '../lib/api';
import type { ExpenseResponse, CategoryResponse, ExpenseSummaryResponse } from '../types';
import { format, startOfMonth } from 'date-fns';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CardSkeleton, TableSkeleton } from '../components/LoadingState';
import { ErrorBanner } from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../lib/useToast';

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
  const { addToast } = useToast();
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [summary, setSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // ─── Confirm dialog state ──────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // ─── Filters ───────────────────────────────────────────
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load expenses';
      setError(msg);
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
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        amount: parseFloat(amount),
        description: description || undefined,
        date,
        categoryId: Number(categoryId),
      };

      if (editingId) {
        await expenseApi.update(editingId, payload);
        addToast('Expense updated successfully', 'success');
      } else {
        await expenseApi.create(payload);
        addToast('Expense added successfully', 'success');
      }

      resetForm();
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save expense';
      setFormError(msg);
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
    setFormError(null);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) return;
    try {
      await expenseApi.delete(deleteTarget);
      addToast('Expense deleted', 'success');
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete expense';
      setError(msg);
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  // ─── Export CSV ─────────────────────────────────────────
  const exportCSV = () => {
    if (expenses.length === 0) return;
    const headers = 'Date,Description,Category,Amount\n';
    const rows = expenses
      .map((e) => `${e.date},"${e.description || ''}","${e.categoryName}",${e.amount}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV exported successfully', 'success');
  };

  // ─── Loading state (first load only) ────────────────────
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading && !expenses.length) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="animate-pulse space-y-2">
            <div className="h-7 w-36 bg-surface-200 rounded dark:bg-surface-700" />
            <div className="h-4 w-48 bg-surface-100 rounded dark:bg-surface-800" />
          </div>
          <div className="h-10 w-36 bg-surface-200 rounded-lg animate-pulse dark:bg-surface-700" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <CardSkeleton />
          <div className="lg:col-span-2"><CardSkeleton rows={4} /></div>
        </div>
        <TableSkeleton rows={5} />
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
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="btn-ghost" title="Export CSV">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(null); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cancel' : 'Add'}</span>
          </button>
        </div>
      </div>

      {/* ─── Running total bar ─────────────────────────────── */}
      {expenses.length > 0 && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 text-sm text-ink-light bg-surface-100/50 rounded-lg dark:bg-surface-800/50 dark:text-surface-300">
          <DollarSign className="w-4 h-4" />
          <span>
            Showing <strong>{expenses.length}</strong> expense{expenses.length !== 1 ? 's' : ''}
            {' — '}
            Total: <strong className="text-ink font-mono dark:text-surface-100">${totalAmount.toFixed(2)}</strong>
          </span>
        </div>
      )}

      {/* ─── Filter Bar ────────────────────────────────────── */}
      <div className="card-minimal p-4 mb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-lighter">Filters</span>

          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-lighter">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-minimal w-auto text-sm py-1.5 px-3" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-lighter">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-minimal w-auto text-sm py-1.5 px-3" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-lighter">Category</label>
            <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : '')} className="input-minimal w-auto text-sm py-1.5 px-3 pr-8">
              <option value="">All</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>
          <button onClick={resetFilters} className="btn-ghost p-1.5 ml-auto" title="Reset filters">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Error Banner ──────────────────────────────────── */}
      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onRetry={fetchData} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* ─── Form ──────────────────────────────────────────── */}
      {showForm && (
        <div className="card-minimal p-6 mb-8 animate-slide-up">
          <h2 className="heading-sm mb-5">{editingId ? 'Edit Expense' : 'New Expense'}</h2>
          {formError && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg border border-danger/20 bg-danger/5">
              <span className="text-sm text-danger flex-1">{formError}</span>
              <button onClick={() => setFormError(null)} className="text-danger/60 hover:text-danger"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Amount</label>
              <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-minimal" placeholder="0.00" required disabled={submitting} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-minimal" required disabled={submitting} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className="input-minimal" required disabled={submitting}>
                <option value="">Select…</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input-minimal" placeholder="Coffee, lunch…" disabled={submitting} />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="btn-secondary" disabled={submitting}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : editingId ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Summary + Chart Section ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="card-minimal p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-ink-lighter" />
            <h2 className="heading-sm !text-xs !tracking-wider !font-medium !uppercase !text-ink-lighter">This Month</h2>
          </div>
          {summary && summary.breakdown.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.breakdown.map((i) => ({ name: i.categoryName, value: i.total }))} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" strokeWidth={0} animationBegin={100} animationDuration={600}>
                    {summary.breakdown.map((_, i) => (<Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontSize: '13px' }} formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center"><p className="text-xs text-ink-lighter">No data yet</p></div>
          )}
        </div>

        <div className="card-minimal p-5 lg:col-span-2">
          <h2 className="heading-sm mb-4">Category Breakdown</h2>
          {summary && summary.breakdown.length > 0 ? (
            <div className="space-y-2">
              {summary.breakdown.map((item, index) => (
                <div key={item.categoryId} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0 dark:border-surface-800">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink dark:text-surface-100">{item.categoryName}</span>
                      <span className="text-sm font-medium text-ink font-mono dark:text-surface-100">${item.total.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-surface-100 rounded-full overflow-hidden dark:bg-surface-800">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(item.percentage, 2)}%`, backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    </div>
                    <span className="text-xs text-ink-lighter">{item.percentage}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32"><p className="text-sm text-ink-lighter">No expenses this month yet.</p></div>
          )}
        </div>
      </div>

      {/* ─── Table ─────────────────────────────────────────── */}
      <div className="card-minimal overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-10 text-center"><p className="text-sm text-ink-lighter">No expenses recorded yet.</p></div>
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
                    <td className="text-ink-lighter font-mono text-xs">{expense.date}</td>
                    <td className="text-ink dark:text-surface-100">{expense.description || '—'}</td>
                    <td><span className="chip">{expense.categoryName}</span></td>
                    <td className="text-right font-mono font-medium dark:text-surface-100">${expense.amount.toFixed(2)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(expense)} className="btn-ghost p-1.5"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteClick(expense.id)} className="btn-ghost p-1.5 text-ink-lighter hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Confirm Dialog ────────────────────────────────── */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
      />
    </div>
  );
}
