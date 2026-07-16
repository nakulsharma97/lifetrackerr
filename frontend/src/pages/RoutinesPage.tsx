import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Pencil, ChevronLeft, ChevronRight,
  Calendar, Clock, Target, Flame, Check, X,
  TrendingUp, Award, BarChart3, AlertCircle, Moon, Sun,
  Filter, ChevronDown, List, Grid3X3,
} from 'lucide-react';
import { routineApi } from '../lib/api';
import type {
  RoutineResponse, RoutineStatsResponse, CalendarMonthResponse,
  CalendarDayResponse, HeatmapEntry,
} from '../types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, subMonths, addMonths } from 'date-fns';

// ─── Schedule type labels ──────────────────────────────────
const SCHEDULE_LABELS: Record<string, string> = {
  TODAY_ONLY: 'Today', TOMORROW_ONLY: 'Tomorrow', EVERY_DAY: 'Daily',
  WEEKDAYS: 'Weekdays', WEEKENDS: 'Weekends', CUSTOM_DAYS: 'Custom',
  SPECIFIC_DATE: 'Specific Date', DATE_RANGE: 'Date Range',
  REPEAT_X_DAYS: 'Repeat Days', REPEAT_X_WEEKS: 'Repeat Weeks',
  MONTHLY: 'Monthly', YEARLY: 'Yearly',
};

const DURATION_OPTIONS = [7, 14, 21, 30, 60, 90, 100, 365];
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#a3a3a3', MEDIUM: '#525252', HIGH: '#171717', CRITICAL: '#dc2626',
};

const HEATMAP_COLORS = ['#f5f5f5', '#d4edda', '#a3d9a5', '#6cbf73', '#389e3d'];

export default function RoutinesPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [routines, setRoutines] = useState<RoutineResponse[]>([]);
  const [calendar, setCalendar] = useState<CalendarMonthResponse | null>(null);
  const [stats, setStats] = useState<RoutineStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formScheduleType, setFormScheduleType] = useState('EVERY_DAY');
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [formCustomDays, setFormCustomDays] = useState('');
  const [formStartDate, setFormStartDate] = useState(format(today, 'yyyy-MM-dd'));
  const [formEndDate, setFormEndDate] = useState('');
  const [formRepeatInterval, setFormRepeatInterval] = useState('1');
  const [formDurationDays, setFormDurationDays] = useState('');
  const [formScheduledTime, setFormScheduledTime] = useState('');
  const [formColor, setFormColor] = useState('#171717');

  const fetchData = useCallback(async () => {
    try {
      const [routinesRes, calendarRes, statsRes] = await Promise.all([
        routineApi.list(),
        routineApi.getCalendar(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
        routineApi.getStats(),
      ]);
      setRoutines(routinesRes.data);
      setCalendar(calendarRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormScheduleType('EVERY_DAY');
    setFormPriority('MEDIUM');
    setFormCustomDays('');
    setFormStartDate(format(today, 'yyyy-MM-dd'));
    setFormEndDate('');
    setFormRepeatInterval('1');
    setFormDurationDays('');
    setFormScheduledTime('');
    setFormColor('#171717');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (r: RoutineResponse) => {
    setFormName(r.name);
    setFormDesc(r.description || '');
    setFormScheduleType(r.scheduleType);
    setFormPriority(r.priority);
    setFormCustomDays(r.customDays || '');
    setFormStartDate(r.startDate);
    setFormEndDate(r.endDate || '');
    setFormRepeatInterval(r.repeatInterval?.toString() || '1');
    setFormDurationDays(r.durationDays?.toString() || '');
    setFormScheduledTime(r.scheduledTime || '');
    setFormColor(r.color || '#171717');
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const payload: any = {
      name: formName.trim(),
      description: formDesc || undefined,
      scheduleType: formScheduleType,
      priority: formPriority,
      customDays: formCustomDays || undefined,
      specificDate: formScheduleType === 'SPECIFIC_DATE' ? formStartDate : undefined,
      startDate: formStartDate,
      endDate: formEndDate || undefined,
      repeatInterval: ['REPEAT_X_DAYS', 'REPEAT_X_WEEKS'].includes(formScheduleType) ? parseInt(formRepeatInterval) : undefined,
      durationDays: formDurationDays ? parseInt(formDurationDays) : undefined,
      scheduledTime: formScheduledTime || undefined,
      color: formColor,
    };
    try {
      if (editingId) await routineApi.update(editingId, payload);
      else await routineApi.create(payload);
      resetForm();
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (routineId: number, dateStr: string, currentCompleted: boolean) => {
    try {
      await routineApi.toggleCompletion(routineId, { date: dateStr, completed: !currentCompleted });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this routine?')) return;
    try { await routineApi.delete(id); fetchData(); } catch (err) { console.error(err); }
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getDayStatus = (date: Date): 'all' | 'partial' | 'missed' | 'none' => {
    if (!calendar) return 'none';
    const key = format(date, 'yyyy-MM-dd');
    const day = calendar.days[key];
    if (!day || day.totalRoutines === 0) return 'none';
    if (day.completedRoutines === day.totalRoutines) return 'all';
    if (day.completedRoutines > 0) return 'partial';
    return 'missed';
  };

  const selectedDayData: CalendarDayResponse | null = calendar
    ? calendar.days[format(selectedDate, 'yyyy-MM-dd')] || null
    : null;

  const statsCards = stats ? [
    { label: 'Active Routines', value: stats.totalActiveRoutines, icon: Target },
    { label: 'Completed Today', value: stats.completedToday, icon: Check, color: 'text-success' },
    { label: 'Missed Today', value: stats.missedToday, icon: X, color: 'text-danger' },
    { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: TrendingUp },
    { label: 'Current Streak', value: `${stats.currentStreak}d`, icon: Flame, color: 'text-orange-500' },
    { label: 'Longest Streak', value: `${stats.longestStreak}d`, icon: Award },
    { label: 'Productivity', value: `${stats.productivityScore}`, icon: BarChart3 },
  ] : [];

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
    <div className="page-container max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-xl">Routines</h1>
          <p className="body-sm mt-1">Track your daily routines with the calendar</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg border border-surface-200 p-0.5">
            <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-surface-100 text-ink' : 'text-ink-lighter hover:text-ink'}`}>
              <Calendar className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface-100 text-ink' : 'text-ink-lighter hover:text-ink'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cancel' : 'Add Routine'}</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {statsCards.map((card, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl border border-surface-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-ink-lighter">{card.label}</span>
              <card.icon className={`w-3.5 h-3.5 ${card.color || 'text-ink-lighter'}`} />
            </div>
            <p className={`text-xl font-semibold ${card.color || 'text-ink'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Calendar ─────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-surface-200 shadow-sm overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-ghost p-2">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-medium text-ink">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentMonth(today)} className="btn-ghost text-xs px-2 py-1">Today</button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-ghost p-2">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 px-4 pt-3 pb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-[10px] uppercase tracking-wider text-ink-lighter font-medium">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 px-4 pb-4 gap-1">
              {/* Empty cells before first day */}
              {Array.from({ length: getDay(startOfMonth(currentMonth)) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {monthDays.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const status = getDayStatus(date);
                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isSameDay(date, today);
                const dayData = calendar?.days[dateStr];

                const statusColors = {
                  all: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  partial: 'bg-amber-100 text-amber-800 border-amber-200',
                  missed: 'bg-red-100 text-red-800 border-red-200',
                  none: 'bg-surface-50 text-ink-lighter border-surface-200',
                };

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95
                      ${statusColors[status]}
                      ${isSelected ? 'ring-2 ring-ink ring-offset-2' : ''}
                      ${isTodayDate && status === 'none' ? 'ring-1 ring-ink/20' : ''}
                    `}
                  >
                    <span className="text-sm font-medium">{format(date, 'd')}</span>
                    {dayData && dayData.totalRoutines > 0 && (
                      <span className="text-[8px] opacity-70 mt-0.5">{dayData.completedRoutines}/{dayData.totalRoutines}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-3 px-4 pb-4">
              <span className="flex items-center gap-1 text-[10px] text-ink-lighter">
                <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-200" /> All
              </span>
              <span className="flex items-center gap-1 text-[10px] text-ink-lighter">
                <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-200" /> Partial
              </span>
              <span className="flex items-center gap-1 text-[10px] text-ink-lighter">
                <span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-200" /> Missed
              </span>
              <span className="flex items-center gap-1 text-[10px] text-ink-lighter">
                <span className="w-2.5 h-2.5 rounded bg-surface-50 border border-surface-200" /> None
              </span>
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDayData && selectedDayData.routines.length > 0 && (
            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl border border-surface-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-ink">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <span className="chip">
                  {selectedDayData.completedRoutines}/{selectedDayData.totalRoutines} completed
                </span>
              </div>
              <div className="space-y-2">
                {selectedDayData.routines.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-surface-50 border border-surface-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(r.id, format(selectedDate, 'yyyy-MM-dd'), r.isCompletedToday)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          r.isCompletedToday ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-surface-300 hover:border-ink'
                        }`}
                      >
                        {r.isCompletedToday && <Check className="w-3 h-3" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink">{r.name}</span>
                          {r.scheduledTime && (
                            <span className="text-[10px] text-ink-lighter flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {r.scheduledTime}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-ink-lighter">
                          {SCHEDULE_LABELS[r.scheduleType] || r.scheduleType}
                          {r.durationDays ? ` · Day ${r.currentDay}/${r.durationDays}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        r.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        r.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                        'bg-surface-200 text-ink-lighter'
                      }`}>
                        {r.priority}
                      </span>
                      <button onClick={() => handleEdit(r)} className="btn-ghost p-1"><Pencil className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Side Panel ───────────────────────────────────── */}
        <div className="space-y-6">
          {/* Form */}
          {showForm && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-surface-200 shadow-sm p-5">
              <h2 className="text-sm font-medium text-ink mb-4">{editingId ? 'Edit Routine' : 'New Routine'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="input-minimal text-sm" placeholder="Routine name" required />
                <input type="text" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="input-minimal text-sm" placeholder="Description (optional)" />
                <select value={formScheduleType} onChange={(e) => setFormScheduleType(e.target.value)} className="input-minimal text-sm">
                  {Object.entries(SCHEDULE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                {formScheduleType === 'CUSTOM_DAYS' && (
                  <div className="flex gap-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                      <button type="button" key={d}
                        onClick={() => {
                          const days = formCustomDays ? formCustomDays.split(',').map(Number) : [];
                          const idx = days.indexOf(i + 1);
                          if (idx >= 0) days.splice(idx, 1);
                          else days.push(i + 1);
                          setFormCustomDays(days.sort((a, b) => a - b).join(','));
                        }}
                        className={`w-8 h-8 rounded-lg text-[10px] font-medium border transition-all ${
                          formCustomDays.split(',').map(Number).includes(i + 1)
                            ? 'bg-ink text-white border-ink'
                            : 'bg-white text-ink-lighter border-surface-200 hover:border-ink/30'
                        }`}>
                        {d.charAt(0)}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-ink-lighter uppercase tracking-wider">Start</label>
                    <input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="input-minimal text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-lighter uppercase tracking-wider">End</label>
                    <input type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="input-minimal text-sm mt-1" />
                  </div>
                </div>
                {['REPEAT_X_DAYS', 'REPEAT_X_WEEKS'].includes(formScheduleType) && (
                  <div>
                    <label className="text-[10px] text-ink-lighter uppercase tracking-wider">Every</label>
                    <input type="number" min="1" value={formRepeatInterval} onChange={(e) => setFormRepeatInterval(e.target.value)} className="input-minimal text-sm mt-1" />
                  </div>
                )}
                <div>
                  <label className="text-[10px] text-ink-lighter uppercase tracking-wider">Duration (Challenge Days)</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {DURATION_OPTIONS.map((d) => (
                      <button type="button" key={d}
                        onClick={() => setFormDurationDays(formDurationDays === d.toString() ? '' : d.toString())}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                          formDurationDays === d.toString()
                            ? 'bg-ink text-white border-ink'
                            : 'bg-white text-ink-lighter border-surface-200 hover:border-ink/30'
                        }`}>
                        {d}d
                      </button>
                    ))}
                    {formDurationDays && !DURATION_OPTIONS.includes(parseInt(formDurationDays)) && (
                      <span className="text-[10px] text-ink-lighter self-center">{formDurationDays}d</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-ink-lighter uppercase tracking-wider">Time</label>
                    <input type="time" value={formScheduledTime} onChange={(e) => setFormScheduledTime(e.target.value)} className="input-minimal text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-lighter uppercase tracking-wider">Priority</label>
                    <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} className="input-minimal text-sm mt-1">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="btn-primary flex-1">{editingId ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Heatmap */}
          {stats?.heatmap && stats.heatmap.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-surface-200 shadow-sm p-5">
              <h3 className="text-[10px] uppercase tracking-widest text-ink-lighter font-medium mb-3">Last 52 Weeks</h3>
              <div className="flex gap-0.5">
                {Array.from({ length: 52 }).map((_, weekIdx) => {
                  const startIdx = weekIdx * 7;
                  const weekDays = stats.heatmap.slice(startIdx, startIdx + 7);
                  return (
                    <div key={weekIdx} className="flex flex-col gap-0.5">
                      {weekDays.map((day, dayIdx) => (
                        <div
                          key={dayIdx}
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: HEATMAP_COLORS[day.level] || HEATMAP_COLORS[0] }}
                          title={`${day.date}: ${day.count} completions`}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-1 mt-2">
                <span className="text-[8px] text-ink-lighter">Less</span>
                {HEATMAP_COLORS.map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                ))}
                <span className="text-[8px] text-ink-lighter">More</span>
              </div>
            </div>
          )}

          {/* Routine List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-surface-200 shadow-sm p-5">
            <h3 className="text-[10px] uppercase tracking-widest text-ink-lighter font-medium mb-4">All Routines</h3>
            {routines.length === 0 ? (
              <p className="text-xs text-ink-lighter text-center py-6">No routines yet. Add one above.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {routines.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border border-surface-100 bg-surface-50/50 hover:bg-surface-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color || '#171717' }} />
                        <span className="text-sm font-medium text-ink">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => handleEdit(r)} className="btn-ghost p-1"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(r.id)} className="btn-ghost p-1 text-ink-lighter hover:text-danger"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-ink-lighter">
                      <span className="chip !text-[9px]">{SCHEDULE_LABELS[r.scheduleType] || r.scheduleType}</span>
                      {r.durationDays && (
                        <span className={`font-medium ${r.currentDay > r.durationDays ? 'text-emerald-600' : ''}`}>
                          Day {Math.min(r.currentDay, r.durationDays)}/{r.durationDays}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5" />{r.currentStreak}</span>
                    </div>
                    {r.durationDays && (
                      <div className="mt-2 h-1 bg-surface-200 rounded-full overflow-hidden">
                        <div className="h-full bg-ink rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(r.progressPercent, 100)}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Summary */}
          {stats && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-surface-200 shadow-sm p-5">
              <h3 className="text-[10px] uppercase tracking-widest text-ink-lighter font-medium mb-4">Analytics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-lighter">Best Week</span>
                  <span className="text-ink font-medium">{stats.bestWeek !== 'N/A' ? format(parseISO(stats.bestWeek), 'MMM d, yyyy') : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-lighter">Best Month</span>
                  <span className="text-ink font-medium">{stats.bestMonth !== 'N/A' ? format(parseISO(stats.bestMonth + '-01'), 'MMMM yyyy') : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-lighter">Most Consistent</span>
                  <span className="text-ink font-medium">{stats.mostConsistentRoutine || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-lighter">Avg Daily</span>
                  <span className="text-ink font-medium">{stats.avgDailyCompletion}/day</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-lighter">Days Tracked</span>
                  <span className="text-ink font-medium">{stats.totalDaysTracked} days</span>
                </div>
                {stats.weeklyReport && Object.keys(stats.weeklyReport).length > 0 && (
                  <div className="pt-2 border-t border-surface-100">
                    <p className="text-[10px] text-ink-lighter uppercase tracking-wider mb-2">This Week</p>
                    <div className="flex gap-1">
                      {Object.entries(stats.weeklyReport).map(([day, count]) => (
                        <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="text-[8px] text-ink-lighter">{day}</div>
                          <div className="w-full bg-surface-100 rounded-full overflow-hidden h-6 flex items-end justify-center">
                            <div className="w-full bg-ink/80 rounded-full transition-all duration-300" style={{ height: `${Math.min((count / Math.max(1, Math.max(...Object.values(stats.weeklyReport!)))) * 100, 100)}%` }} />
                          </div>
                          <div className="text-[8px] font-medium text-ink">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
