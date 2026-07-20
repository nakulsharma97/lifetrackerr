import { useState, useEffect } from 'react';
import { Plus, Trash2, Flame, Check, Loader2 } from 'lucide-react';
import { habitApi } from '../lib/api';
import type { HabitResponse } from '../types';
import {
  format,
  subDays,
  startOfDay,
  parseISO,
  isSameDay,
} from 'date-fns';
import ConfirmModal from '../components/ConfirmModal';

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchHabits = async () => {
    try {
      const { data } = await habitApi.list();
      setHabits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await habitApi.update(editingId, { name: name.trim() });
      } else {
        await habitApi.create({ name: name.trim() });
      }
      resetForm();
      fetchHabits();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm(null);
    try {
      await habitApi.delete(id);
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (habitId: number, dateStr: string, currentCompleted: boolean) => {
    const key = `${habitId}-${dateStr}`;
    if (toggling.has(key)) return;

    setToggling((prev) => new Set(prev).add(key));
    try {
      await habitApi.log(habitId, {
        date: dateStr,
        completed: !currentCompleted,
      });
      fetchHabits();
    } catch (err) {
      console.error(err);
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
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
          <h1 className="heading-xl">Habits</h1>
          <p className="body-sm mt-1">Build your daily routines</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel' : 'Add Habit'}</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirm !== null}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? All progress and logs will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => deleteConfirm !== null && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Form */}
      {showForm && (
        <div className="card-minimal p-6 mb-8 animate-slide-up">
          <h2 className="heading-sm mb-5">
            {editingId ? 'Edit Habit' : 'New Habit'}
          </h2>
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-ink-lighter mb-1 uppercase tracking-wider">
                Habit Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-minimal"
                placeholder="Read, Exercise, Meditate…"
                required
                disabled={submitting}
              />
            </div>
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
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary" disabled={submitting}>
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-lighter">
            No habits yet. Start by adding one above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="card-minimal p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-medium text-ink dark:text-surface-200">
                    {habit.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-ink-lighter">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      {habit.currentStreak}
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-success" />
                      {habit.totalCompletions}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirm(habit.id)}
                  className="btn-ghost p-1.5 text-ink-lighter hover:text-danger"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 7-day grid */}
              <div className="flex gap-2">
                {last7Days.map((day) => {
                  const logged = isLogged(habit, day);
                  const isToday = isSameDay(day, today);
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const toggleKey = `${habit.id}-${dayStr}`;
                  const isLoading = toggling.has(toggleKey);

                  return (
                    <button
                      key={dayStr}
                      onClick={() =>
                        handleToggle(habit.id, dayStr, logged === true)
                      }
                      disabled={isLoading}
                      className={`
                        flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200
                        ${logged === true
                          ? 'bg-success/10'
                          : logged === false
                            ? 'bg-surface-100 dark:bg-surface-800'
                            : 'bg-surface-50 border border-surface-200 border-dashed dark:bg-surface-900 dark:border-surface-700'
                        }
                        ${isToday ? 'ring-1 ring-ink/10 dark:ring-surface-100/10' : ''}
                        hover:scale-105 active:scale-95
                        ${isLoading ? 'opacity-50 animate-pulse pointer-events-none' : ''}
                      `}
                      title={`${format(day, 'EEE, MMM d')}`}
                    >
                      <span className="text-[10px] font-medium text-ink-lighter uppercase dark:text-surface-500">
                        {format(day, 'EEE').charAt(0)}
                      </span>
                      <div
                        className={`
                          w-7 h-7 rounded-full flex items-center justify-center
                          transition-colors duration-200
                          ${logged === true
                            ? 'bg-success text-white'
                            : logged === false
                              ? 'bg-surface-200 text-ink-lighter dark:bg-surface-700'
                              : 'bg-transparent'
                          }
                        `}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin text-ink-lighter" />
                        ) : logged === true ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : null}
                      </div>
                      <span className="text-[10px] text-ink-lighter dark:text-surface-500">
                        {format(day, 'd')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
