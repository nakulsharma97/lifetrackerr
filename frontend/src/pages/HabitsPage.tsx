import { useState, useEffect } from 'react';
import { Plus, Trash2, Flame, Check, StickyNote, Sparkles, Target } from 'lucide-react';
import { habitApi } from '../lib/api';
import type { HabitResponse } from '../types';
import { format, subDays, startOfDay, parseISO, isSameDay } from 'date-fns';

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});

  const fetchHabits = async () => {
    try {
      const { data } = await habitApi.list();
      setHabits(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchHabits(); }, []);

  const resetForm = () => { setName(''); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editingId) await habitApi.update(editingId, { name: name.trim() });
      else await habitApi.create({ name: name.trim() });
      resetForm();
      fetchHabits();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this habit?')) return;
    try { await habitApi.delete(id); fetchHabits(); } catch (err) { console.error(err); }
  };

  const handleToggle = async (habitId: number, dateStr: string, currentCompleted: boolean) => {
    const note = noteText[`${habitId}-${dateStr}`] || '';
    try {
      await habitApi.log(habitId, { date: dateStr, completed: !currentCompleted, note: note || undefined });
      setNoteText(prev => { const n = { ...prev }; delete n[`${habitId}-${dateStr}`]; return n; });
      fetchHabits();
    } catch (err) { console.error(err); }
  };

  const handleSaveNote = async (habitId: number, dateStr: string) => {
    const note = noteText[`${habitId}-${dateStr}`];
    if (!note?.trim()) return;
    try {
      await habitApi.log(habitId, { date: dateStr, completed: true, note });
      setNoteText(prev => { const n = { ...prev }; delete n[`${habitId}-${dateStr}`]; return n; });
      fetchHabits();
    } catch (err) { console.error(err); }
  };

  const today = startOfDay(new Date());
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  const isLogged = (habit: HabitResponse, date: Date): boolean | null => {
    const log = habit.recentLogs.find(l => isSameDay(parseISO(l.date), date));
    return log ? log.completed : null;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-ink-lighter">
            <span className="w-5 h-5 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
            Loading habits…
          </div>
        </div>
      </div>
    );
  }

  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-xl flex items-center gap-3">
            Habits
            {habits.length > 0 && <span className="text-xs font-normal bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-full">{habits.length} active</span>}
          </h1>
          <p className="body-sm mt-1 text-ink-lighter">Build your daily routines</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> <span>{showForm ? 'Cancel' : 'Add Habit'}</span>
        </button>
      </div>

      {/* Quick Stats */}
      {habits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 stagger-children">
          <div className="card-glass p-4 text-center">
            <p className="stat-label">Total Streak</p>
            <p className="text-2xl font-light mt-1 flex items-center justify-center gap-1.5"><Flame className="w-5 h-5 text-orange-500" />{totalStreak}</p>
          </div>
          <div className="card-glass p-4 text-center">
            <p className="stat-label">Completions</p>
            <p className="text-2xl font-light mt-1 flex items-center justify-center gap-1.5"><Check className="w-5 h-5 text-emerald-500" />{totalCompletions}</p>
          </div>
          <div className="card-glass p-4 text-center">
            <p className="stat-label">Avg Streak</p>
            <p className="text-2xl font-light mt-1">{habits.length > 0 ? Math.round(totalStreak / habits.length) : 0}d</p>
          </div>
          <div className="card-glass p-4 text-center">
            <p className="stat-label">Best Streak</p>
            <p className="text-2xl font-light mt-1">{Math.max(...habits.map(h => h.longestStreak), 0)}d</p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card-glass p-6 mb-8 animate-slide-down">
          <h2 className="heading-sm mb-5 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />{editingId ? 'Edit Habit' : 'New Habit'}</h2>
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-ink-lighter mb-1.5 uppercase tracking-wider">Habit Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-glass" placeholder="Read, Exercise, Meditate…" required />
            </div>
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
            {editingId && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
          </form>
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="card-glass p-14 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ink/5 dark:bg-surface-100/5 mb-4">
            <Target className="w-6 h-6 text-ink-lighter" />
          </div>
          <p className="text-sm text-ink-lighter">No habits yet. Start by adding one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {habits.map(habit => (
            <div key={habit.id} className="card-glass-hover p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-medium text-ink dark:text-surface-100">{habit.name}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="chip-success flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{habit.currentStreak}</span>
                    <span className="chip flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" />{habit.totalCompletions}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(habit.id)} className="btn-ghost p-1.5 text-ink-lighter hover:text-danger transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 7-day grid */}
              <div className="flex gap-2">
                {last7Days.map(day => {
                  const logged = isLogged(habit, day);
                  const isTodayDate = isSameDay(day, today);
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const existingNote = habit.recentLogs.find(l => isSameDay(parseISO(l.date), day))?.note;

                  return (
                    <div key={dayStr} className="flex flex-col items-center gap-1 flex-1">
                      <button onClick={() => handleToggle(habit.id, dayStr, logged === true)}
                        className={`w-full flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200
                          ${logged === true ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30' :
                            logged === false ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30' :
                            'bg-white/50 dark:bg-surface-800/50 border border-dashed border-surface-200 dark:border-surface-700'}
                          ${isTodayDate ? 'ring-2 ring-ink/10 dark:ring-surface-100/10' : ''}
                          hover:scale-105 active:scale-95`}>
                        <span className="text-[9px] font-semibold text-ink-lighter uppercase tracking-wider">{format(day, 'EEE').charAt(0)}</span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
                          ${logged === true ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' :
                            logged === false ? 'bg-red-400 text-white' : 'bg-surface-200 dark:bg-surface-700'}`}>
                          {logged === true && <Check className="w-4 h-4" />}
                          {logged === null && <span className="text-[10px] font-medium text-ink-lighter/60">{format(day, 'd')}</span>}
                          {logged === false && <X className="w-4 h-4" />}
                        </div>
                      </button>
                      {existingNote && (
                        <span className="text-[8px] text-ink-lighter/60 text-center leading-tight truncate w-full px-0.5" title={existingNote}>
                          📝 {existingNote.length > 8 ? existingNote.slice(0, 8) + '…' : existingNote}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Note input */}
              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-surface-100/50 dark:border-surface-800/50">
                <StickyNote className="w-3.5 h-3.5 text-ink-lighter flex-shrink-0" />
                <input type="text" placeholder="Add a note about today…"
                  value={noteText[`${habit.id}-today`] || ''}
                  onChange={e => setNoteText(prev => ({ ...prev, [`${habit.id}-today`]: e.target.value }))}
                  className="flex-1 bg-transparent border-0 border-b border-surface-200 dark:border-surface-700 pb-0.5 text-xs text-ink placeholder:text-ink-lighter/40 focus:outline-none focus:border-ink/30 transition-colors" />
                {noteText[`${habit.id}-today`]?.trim() && (
                  <button onClick={() => handleSaveNote(habit.id, format(today, 'yyyy-MM-dd'))}
                    className="text-[10px] font-medium text-ink hover:text-ink-light transition-colors px-2 py-1 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800">Save</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Missing X import — add at top level
import { X } from 'lucide-react';
