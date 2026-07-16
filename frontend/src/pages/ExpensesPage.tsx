import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, PieChart as PieChartIcon, RotateCcw, ChevronLeft, ChevronRight, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { expenseApi, categoryApi, recurringApi } from '../lib/api';
import type { ExpenseResponse, CategoryResponse, ExpenseSummaryResponse, ExpensePageResponse, RecurringExpenseResponse } from '../types';
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

const PAGE_SIZE = 10;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [summary, setSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // ─── Recurring Expenses ──────────────────────────────────
  const [showRecurring, setShowRecurring] = useState(false);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseResponse[]>([]);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [recName, setRecName] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recDayOfMonth, setRecDayOfMonth] = useState('1');
  const [recFrequency, setRecFrequency] = useState('MONTHLY');
  const [recCatId, setRecCatId] = useState<number | ''>('');
  const [recStartDate, setRecStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recEndDate, setRecEndDate] = useState('');
  const [recEditingId, setRecEditingId] = useState<number | null>(null);

  // ─── Filters + Pagination ─────────────────────────────────
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        from: dateFrom,
        to: dateTo,
        page,
        size: PAGE_SIZE,
      };
      if (filterCategoryId !== '') {
        params.categoryId = String(filterCategoryId);
      }

      const [expRes, catRes, summaryRes] = await Promise.all([
        expenseApi.list(params),
        categoryApi.list('EXPENSE'),
        expenseApi.summary(),
      ]);

      const pageData = expRes.data as ExpensePageResponse;
      setExpenses(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      setCategories(catRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, filterCategoryId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchRecurring = useCallback(async () => {
    try {
      const res = await recurringApi.list();
      setRecurringExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (showRecurring) fetchRecurring();
  }, [showRecurring, fetchRecurring]);

  const resetRecurringForm = () => {
    setRecName('');
    setRecAmount('');
    setRecDesc('');
    setRecDayOfMonth('1');
    setRecFrequency('MONTHLY');
    setRecCatId('');
    setRecStartDate(format(new Date(), 'yyyy-MM-dd'));
    setRecEndDate('');
    setRecEditingId(null);
    setShowRecurringForm(false);
  };

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recName || !recAmount || !recCatId) return;
    try {
      const payload = {
        name: recName,
        amount: parseFloat(recAmount),
        description: recDesc || undefined,
        dayOfMonth: parseInt(recDayOfMonth),
        frequency: recFrequency,
        categoryId: Number(recCatId),
        startDate: recStartDate,
        endDate: recEndDate || undefined,
      };
      if (recEditingId) {
        await recurringApi.update(recEditingId, payload);
      } else {
        await recurringApi.create(payload);
      }
      resetRecurringForm();
      fetchRecurring();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecurringEdit = (re: RecurringExpenseResponse) => {
    setRecName(re.name);
    setRecAmount(re.amount.toString());
    setRecDesc(re.description || '');
    setRecDayOfMonth(re.dayOfMonth.toString());
    setRecFrequency(re.frequency);
    setRecCatId(re.categoryId);
    setRecStartDate(re.startDate);
    setRecEndDate(re.endDate || '');
    setRecEditingId(re.id);
    setShowRecurringForm(true);
  };

  const handleRecurringDelete = async (id: number) => {
    if (!window.confirm('Delete this recurring expense?')) return;
    try {
      await recurringApi.delete(id);
      fetchRecurring();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecurringToggle = async (id: number) => {
    try {
      await recurringApi.toggleActive(id);
      fetchRecurring();
    } catch (err) {
      console.error(err);
    }
  };

  const resetFilters = () => {
    setDateFrom(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
    setFilterCategoryId('');
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
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
      setPage(0);
      fetchData();
    } catch (err) {
      console.error(err);
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

  // Generate page number array for pagination
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push('...');
      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-ink-lighter">Loading…</p>
        </div>
      </div>
    );
  }

  const startRecord = totalElements > 0 ? page * PAGE_SIZE + 1 : 0;
  const endRecord = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="heading-xl">Expenses</h1>
          <p className="body-sm mt-1">Track your spending</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowRecurring(!showRecurring); if (!showRecurring) setShowForm(false); }}
            className={`btn-ghost text-xs ${showRecurring ? 'bg-surface-100 text-ink' : ''}`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recurring</span>
          </button>
          {!showRecurring && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>{showForm ? 'Cancel' : 'Add Expense'}</span>
            </button>
          )}
        </div>
      </div>

      {showRecurring ? (
        /* ─── RECURRING EXPENSES VIEW ────────────────────────── */
        <>
          {/* Recurring Form */}
          {showRecurringForm && (
            <div className="card-minimal p-6 mb-8 animate-slide-up">
              <h2 className="heading-sm mb-5">{recEditingId ? 'Edit Recurring' : 'New Recurring Expense'}</h2>
              <form onSubmit={handleRecurringSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Name</label>
                  <input type="text" value={recName} onChange={(e) => setRecName(e.target.value)} className="input-minimal" placeholder="Netflix, Rent…" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Amount</label>
                  <input type="number" step="0.01" min="0" value={recAmount} onChange={(e) => setRecAmount(e.target.value)} className="input-minimal" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Category</label>
                  <select value={recCatId} onChange={(e) => setRecCatId(Number(e.target.value))} className="input-minimal" required>
                    <option value="">Select…</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Day of Month</label>
                  <input type="number" min="1" max="31" value={recDayOfMonth} onChange={(e) => setRecDayOfMonth(e.target.value)} className="input-minimal" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Frequency</label>
                  <select value={recFrequency} onChange={(e) => setRecFrequency(e.target.value)} className="input-minimal">
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Start Date</label>
                  <input type="date" value={recStartDate} onChange={(e) => setRecStartDate(e.target.value)} className="input-minimal" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">End Date (optional)</label>
                  <input type="date" value={recEndDate} onChange={(e) => setRecEndDate(e.target.value)} className="input-minimal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Description</label>
                  <input type="text" value={recDesc} onChange={(e) => setRecDesc(e.target.value)} className="input-minimal" placeholder="Subscription notes…" />
                </div>
                <div className="sm:col-span-4 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={resetRecurringForm} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{recEditingId ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-ink-lighter">{recurringExpenses.length} recurring expense(s)</span>
            <button onClick={() => setShowRecurringForm(!showRecurringForm)} className="btn-primary">
              <Plus className="w-4 h-4" />
              <span>{showRecurringForm ? 'Cancel' : 'Add Template'}</span>
            </button>
          </div>

          {recurringExpenses.length === 0 ? (
            <div className="card-minimal p-10 text-center">
              <p className="text-sm text-ink-lighter">No recurring expenses yet. Add a template to auto-create expenses monthly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringExpenses.map((re) => (
                <div key={re.id} className={`card-minimal p-5 flex items-center justify-between ${!re.active ? 'opacity-50' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-medium text-ink">{re.name}</h3>
                      <span className="chip">{re.categoryName}</span>
                      <span className="text-xs text-ink-lighter font-mono">${re.amount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-ink-lighter mt-1">
                      Every {re.dayOfMonth}th &middot; {re.frequency.toLowerCase()} &middot; Since {re.startDate}
                      {re.endDate ? ` until ${re.endDate}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRecurringToggle(re.id)} className="btn-ghost p-1.5" title={re.active ? 'Pause' : 'Activate'}>
                      {re.active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-ink-lighter" />}
                    </button>
                    <button onClick={() => handleRecurringEdit(re)} className="btn-ghost p-1.5"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleRecurringDelete(re.id)} className="btn-ghost p-1.5 text-ink-lighter hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ─── REGULAR EXPENSES VIEW ──────────────────────────── */
        <>
          {/* ─── Filter Bar ────────────────────────────────────── */}
          <div className="card-minimal p-4 mb-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-lighter">Filters</span>

              <div className="flex items-center gap-2">
                <label className="text-xs text-ink-lighter">From</label>
                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className="input-minimal w-auto text-sm py-1.5 px-3" />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-ink-lighter">To</label>
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className="input-minimal w-auto text-sm py-1.5 px-3" />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-ink-lighter">Category</label>
                <select value={filterCategoryId} onChange={(e) => { setFilterCategoryId(e.target.value ? Number(e.target.value) : ''); setPage(0); }} className="input-minimal w-auto text-sm py-1.5 px-3 pr-8">
                  <option value="">All</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <button onClick={resetFilters} className="btn-ghost p-1.5 ml-auto" title="Reset filters">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="card-minimal p-6 mb-8 animate-slide-up">
              <h2 className="heading-sm mb-5">{editingId ? 'Edit Expense' : 'New Expense'}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Amount</label>
                  <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-minimal" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-minimal" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className="input-minimal" required>
                    <option value="">Select…</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Description</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input-minimal" placeholder="Coffee, lunch…" />
                </div>
                <div className="sm:col-span-4 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          )}

          {/* Summary + Chart */}
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
                      <Pie
                        data={summary.breakdown.map((item) => ({ name: item.categoryName, value: item.total }))}
                        cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        paddingAngle={2} dataKey="value" strokeWidth={0}
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
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center">
                  <p className="text-xs text-ink-lighter">No data yet</p>
                </div>
              )}
            </div>

            <div className="card-minimal p-5 lg:col-span-2">
              <h2 className="heading-sm mb-4">Category Breakdown</h2>
              {summary && summary.breakdown.length > 0 ? (
                <div className="space-y-2">
                  {summary.breakdown.map((item, index) => (
                    <div key={item.categoryId} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-ink">{item.categoryName}</span>
                          <span className="text-sm font-medium text-ink font-mono">${item.total.toFixed(2)}</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(item.percentage, 2)}%`, backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                        </div>
                        <span className="text-xs text-ink-lighter">{item.percentage}% of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-ink-lighter">No expenses this month yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Running total + record count bar */}
          {totalElements > 0 && (
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-xs text-ink-lighter">
                Showing {startRecord}–{endRecord} of {totalElements} expenses
              </p>
            </div>
          )}

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
                        <td className="text-ink-lighter font-mono text-xs">{expense.date}</td>
                        <td className="text-ink">{expense.description || '—'}</td>
                        <td><span className="chip">{expense.categoryName}</span></td>
                        <td className="text-right font-mono font-medium">${expense.amount.toFixed(2)}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(expense)} className="btn-ghost p-1.5"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(expense.id)} className="btn-ghost p-1.5 text-ink-lighter hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ─── Pagination ──────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100">
                <p className="text-xs text-ink-lighter">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} className="btn-ghost p-1.5 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-xs text-ink-lighter">…</span>
                    ) : (
                      <button key={p} onClick={() => handlePageChange(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150
                        ${p === page
                          ? 'bg-ink text-white dark:bg-surface-100 dark:text-ink'
                          : 'text-ink-lighter hover:bg-surface-100 dark:hover:bg-surface-800'
                        }`}>
                        {p + 1}
                      </button>
                    )
                  )}

                  <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} className="btn-ghost p-1.5 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
