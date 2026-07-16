import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Flame, Check, X } from 'lucide-react';
import { habitApi } from '../lib/api';
import type { HabitResponse } from '../types';
import {
  format,
  subDays,
  startOfDay,
  parseISO,
  isSameDay,
} from 'date-fns';
import { ListSkeleton } from '../components/LoadingState';
import { ErrorBanner } from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../lib/useToast';

export default function HabitsPage() {
  const { addToast } = useToast();
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Confirm dialog state ──────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await habitApi.list();
      setHabits(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load habits';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setShowForm(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await habitApi.update(editingId, { name: name.trim() });
        addToast('Habit updated successfully', 'success');
      } else {
        await habitApi.create({ name: name.trim() });
        addToast('Habit created successfully', 'success');
      }
      resetForm();
      fetchHabits();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save habit';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) return;
    try {
      await habitApi.delete(deleteTarget);
      addToast('Habit deleted', 'success');
      fetchHabits();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete habit';
      setError(msg);
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (habitId: number, dateStr: string, currentCompleted: boolean) => {
    try {
      await habitApi.log(habitId, {
        date: dateStr,
        completed: !currentCompleted,
      });
      addToast(!currentCompleted ? 'Logged!' : 'Unlogged', 'success');
      fetchHabits();
    } catch {
      setError('Failed to update habit log');
    }
  };

  // Generate last 7 days
  const today = startOfDay(new Date());
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  const isLogged = (habit: HabitResponse, date: Date): boolean | null => {
    const log = habit.recentLogs.find((l) =>
      isSameDay(parseISO(l.date), date)
    );
    return log ? log.completed : null;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="animate-pulse space-y-2">
            <div className="h-7 w-36 bg-surface-200 rounded dark:bg-surface-700" />
            <div className="h-4 w-48 bg-surface-100 rounded dark:bg-surface-800" />
          </div>
          <div className="h-10 w-36 bg-surface-200 rounded-lg animate-pulse dark:bg-surface-700" />
        </div>
        <ListSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="heading-xl">Habits</h1>
          <p className="body-sm mt-1">Build your daily routines</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setFormError(null); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel' : 'Add Habit'}</span>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onRetry={fetchHabits} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card-minimal p-6 mb-8 animate-slide-up">
          <h2 className="heading-sm mb-5">{editingId ? 'Edit Habit' : 'New Habit'}</h2>
          {formError && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg border border-danger/20 bg-danger/5">
              <span className="text-sm text-danger flex-1">{formError}</span>
              <button onClick={() => setFormError(null)} className="text-danger/60 hover:text-danger"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">Habit Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-minimal" placeholder="Read, Exercise, Meditate…" required disabled={submitting} />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : editingId ? 'Update' : 'Add'}</button>
            {editingId && (<button type="button" onClick={resetForm} className="btn-secondary" disabled={submitting}>Cancel</button>)}
          </form>
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-lighter">No habits yet. Start by adding one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="card-minimal p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-medium text-ink dark:text-surface-100">{habit.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-ink-lighter">
                    <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" />{habit.currentStreak}</span>
                    <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-success" />{habit.totalCompletions}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteClick(habit.id)} className="btn-ghost p-1.5 text-ink-lighter hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>

              {/* 7-day grid */}
              <div className="flex gap-2 flex-wrap">
                {last7Days.map((day) => {
                  const logged = isLogged(habit, day);
                  const isToday = isSameDay(day, today);
                  const dayStr = format(day, 'yyyy-MM-dd');

                  return (
                    <button
                      key={dayStr}
                      onClick={() => handleToggle(habit.id, dayStr, logged === true)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200
                        ${logged === true ? 'bg-success/10' : logged === false ? 'bg-surface-100' : 'bg-surface-50 border border-surface-200 border-dashed'}
                        ${isToday ? 'ring-1 ring-ink/10' : ''}
                        hover:scale-105 active:scale-95 dark:bg-surface-800 dark:border-surface-700`}
                      title={`${format(day, 'EEE, MMM d')}`}
                    >
                      <span className="text-[10px] font-medium text-ink-lighter uppercase">{format(day, 'EEE').charAt(0)}</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200
                        ${logged === true ? 'bg-success text-white' : logged === false ? 'bg-surface-200 text-ink-lighter' : 'bg-transparent'}`}>
                        {logged === true && <Check className="w-3.5 h-3.5" />}
                        {logged === null && <span className="text-[10px] text-ink-lighter/40">?</span>}
                      </div>
                      <span className="text-[10px] text-ink-lighter">{format(day, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? All your logs for this habit will also be removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
      />
    </div>
  );
}
