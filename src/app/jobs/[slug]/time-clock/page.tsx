'use client'

import { useState, useEffect } from 'react';
import { Clock, Check, Calendar, TrendingUp, AlertCircle, LogIn, LogOut, Loader2 } from 'lucide-react';

// Props interface
interface TimeClockProps {
  userId: string;
  userName: string;
}

interface TimeEntry {
  id: number;
  clock_in: string;
  clock_out: string | null;
  total_hours: number | null;
  is_late: boolean;
  is_early_leave: boolean;
  is_overtime: boolean;
  status: string;
}

interface WeeklySummary {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  onTimeDays: number;
  lateDays: number;
  totalDays: number;
}

interface ClockStatusResponse {
  success: boolean;
  clockedIn: boolean;
  todayEntry: TimeEntry | null;
  shift?: { start_time: string; end_time: string };
}

interface HistoryResponse {
  success: boolean;
  entries: TimeEntry[];
}

interface SummaryResponse {
  success: boolean;
  summary: WeeklySummary;
}

interface ActionResponse {
  success: boolean;
  entry: TimeEntry;
  error?: string;
}

// --------------------
// Client Component
// --------------------
export function TimeClock({ userId, userName }: TimeClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [todayEntry, setTodayEntry] = useState<TimeEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'clock' | 'history'>('clock');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [shift, setShift] = useState({ start_time: '09:00:00', end_time: '17:00:00' });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial status
  useEffect(() => {
    fetchClockStatus();
    fetchWeeklySummary();
  }, [userId]);

  // Fetch history when tab changes
  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const fetchClockStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timeclock?userId=${userId}&action=status`);
      const data: ClockStatusResponse = await response.json();

      if (data.success) {
        setClockedIn(data.clockedIn);
        setTodayEntry(data.todayEntry);
        if (data.shift) setShift(data.shift);
        if (data.todayEntry?.clock_in) setClockInTime(new Date(data.todayEntry.clock_in));
      }
    } catch (err) {
      console.error(err);
      showError('Failed to load clock status');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/timeclock?userId=${userId}&action=history`);
      const data: HistoryResponse = await response.json();

      if (data.success) setTimeEntries(data.entries);
    } catch (err) {
      console.error(err);
      showError('Failed to load history');
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      const response = await fetch(`/api/timeclock?userId=${userId}&action=summary`);
      const data: SummaryResponse = await response.json();

      if (data.success) setWeeklySummary(data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch('/api/timeclock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'clock_in' })
      });

      const data: ActionResponse = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to clock in');

      if (data.success) {
        setClockedIn(true);
        setClockInTime(new Date(data.entry.clock_in));
        setTodayEntry(data.entry);
        showSuccess('Clocked in successfully! ✓');
        fetchWeeklySummary();
      }
    } catch (err: unknown) {
      showError((err as Error).message || 'Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch('/api/timeclock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'clock_out' })
      });

      const data: ActionResponse = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to clock out');

      if (data.success) {
        setClockedIn(false);
        setClockInTime(null);
        setTodayEntry(data.entry);
        showSuccess('Clocked out successfully! ✓');
        fetchWeeklySummary();
      }
    } catch (err: unknown) {
      showError((err as Error).message || 'Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatDateShort = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatTimeShort = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const calculateWorkedHours = () => {
    if (!clockInTime) return '0:00';
    const diff = currentTime.getTime() - clockInTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (entry: TimeEntry) => {
    if (entry.is_late) return 'text-orange-600 bg-orange-50';
    if (entry.is_overtime) return 'text-purple-600 bg-purple-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusText = (entry: TimeEntry) => {
    if (entry.is_late) return 'Late';
    if (entry.is_overtime) return 'Overtime';
    return 'On Time';
  };

  const getStatusIcon = (entry: TimeEntry) => {
    if (entry.is_late) return <AlertCircle className="w-3 h-3" />;
    if (entry.is_overtime) return <TrendingUp className="w-3 h-3" />;
    return <Check className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Time Clock</h1>
                <p className="text-xs text-gray-600">{userName}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('clock')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'clock' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Clock In/Out
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'clock' ? (
          <>
            {/* Current Time Display */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{formatDate(currentTime)}</p>
                <div className="text-5xl font-bold text-gray-900 mb-4 font-mono">{formatTime(currentTime)}</div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Shift: {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</span>
                </div>
              </div>
            </div>

            {/* Clock In/Out Action */}
            {!clockedIn ? (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
                  {actionLoading ? 'Clocking In...' : 'Clock In'}
                </div>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-800 font-semibold">Active Session</span>
                    </div>
                    <span className="text-green-600 text-sm">
                      Clocked in at {clockInTime ? formatTime(clockInTime) : ''}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Time Worked</p>
                      <div className="text-3xl font-bold text-gray-900 font-mono">{calculateWorkedHours()}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClockOut}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-6 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-3">
                    {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogOut className="w-6 h-6" />}
                    {actionLoading ? 'Clocking Out...' : 'Clock Out'}
                  </div>
                </button>
              </div>
            )}

            {/* Weekly Summary */}
            {weeklySummary && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">This Week</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{weeklySummary.totalHours.toFixed(1)}</p>
                    <p className="text-xs text-gray-600">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{weeklySummary.onTimeDays}</p>
                    <p className="text-xs text-gray-600">On Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{weeklySummary.overtimeHours.toFixed(1)}</p>
                    <p className="text-xs text-gray-600">Overtime</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Entries</h3>
            </div>

            {timeEntries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No time entries yet</p>
                <p className="text-sm text-gray-400 mt-1">Clock in to start tracking your hours</p>
              </div>
            ) : (
              timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{formatDateShort(entry.clock_in)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry)}`}>
                      <span className="flex items-center gap-1">{getStatusIcon(entry)}{getStatusText(entry)}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span>In: {formatTimeShort(entry.clock_in)}</span>
                      <span>Out: {entry.clock_out ? formatTimeShort(entry.clock_out) : '—'}</span>
                    </div>
                    {entry.total_hours && <span className="font-semibold text-gray-900">{entry.total_hours.toFixed(2)}h</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --------------------
// Page Component for App Router
// --------------------
interface PageProps {
  params: { slug: string };
}

export default function TimeClockPage({ params }: PageProps) {
  const userId = params.slug; // you can adjust this if you fetch user differently
  const userName = 'John Doe'; // fetch or pass actual name if needed

  return <TimeClock userId={userId} userName={userName} />;
}
