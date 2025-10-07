//TimeClockModal.tsx

import { useState, useEffect } from 'react';
import { Clock, X, LogIn, LogOut, Loader2, TrendingUp, Check, AlertCircle } from 'lucide-react';

interface TimeClockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userRole?: string; // 'employee' or 'manager'
  onOpenManagerDashboard?: () => void;
}

export default function TimeClockModal({ 
  isOpen, 
  onClose, 
  userId, 
  userName,
  userRole,
  onOpenManagerDashboard 
}: TimeClockModalProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Fetch status when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClockStatus();
      fetchWeeklySummary();
    }
  }, [isOpen, userId]);

  const fetchClockStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timeclock?userId=${userId}&action=status`);
      const data = await response.json();

      if (data.success) {
        setClockedIn(data.clockedIn);
        if (data.todayEntry?.clock_in) {
          setClockInTime(new Date(data.todayEntry.clock_in));
        }
      }
    } catch (err) {
      console.error('Failed to fetch clock status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      const response = await fetch(`/api/timeclock?userId=${userId}&action=summary`);
      const data = await response.json();
      if (data.success) {
        setWeeklySummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clock in');
      }

      setClockedIn(true);
      setClockInTime(new Date(data.entry.clock_in));
      setSuccess('Clocked in successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchWeeklySummary();
    } catch (err: any) {
      setError(err.message || 'Failed to clock in');
      setTimeout(() => setError(null), 5000);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clock out');
      }

      setClockedIn(false);
      setClockInTime(null);
      setSuccess('Clocked out successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchWeeklySummary();
    } catch (err: any) {
      setError(err.message || 'Failed to clock out');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const calculateWorkedHours = () => {
    if (!clockInTime) return '0:00';
    const diff = currentTime.getTime() - clockInTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Time Clock</h2>
              <p className="text-xs text-gray-600">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Current Time */}
              <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="text-4xl font-bold text-gray-900 font-mono mb-2">
                  {formatTime(currentTime)}
                </div>
                <p className="text-sm text-gray-600">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Clock In/Out */}
              {!clockedIn ? (
                <button
                  onClick={handleClockIn}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <LogIn className="w-5 h-5" />
                    )}
                    {actionLoading ? 'Clocking In...' : 'Clock In'}
                  </div>
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Active Session */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-800 font-semibold text-sm">Active Session</span>
                      </div>
                      <span className="text-green-600 text-xs">
                        Since {clockInTime ? formatTime(clockInTime) : ''}
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Time Worked</p>
                      <div className="text-2xl font-bold text-gray-900 font-mono">
                        {calculateWorkedHours()}
                      </div>
                    </div>
                  </div>

                  {/* Clock Out Button */}
                  <button
                    onClick={handleClockOut}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {actionLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <LogOut className="w-5 h-5" />
                      )}
                      {actionLoading ? 'Clocking Out...' : 'Clock Out'}
                    </div>
                  </button>
                </div>
              )}

              {/* Weekly Summary */}
              {weeklySummary && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 text-sm">This Week</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">
                        {weeklySummary.totalHours.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600">Hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">
                        {weeklySummary.onTimeDays}
                      </p>
                      <p className="text-xs text-gray-600">On Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-orange-600">
                        {weeklySummary.overtimeHours.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600">Overtime</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manager Link */}
              {userRole === 'manager' && onOpenManagerDashboard && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenManagerDashboard();
                  }}
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 rounded-xl font-medium text-sm transition-colors border border-indigo-200"
                >
                  View Team Dashboard
                </button>
              )}

              {/* View Full History Link */}
              <button
                onClick={onClose}
                className="w-full text-blue-600 hover:text-blue-700 py-2 text-sm font-medium transition-colors"
              >
                View Full History →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}