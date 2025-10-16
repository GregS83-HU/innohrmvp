'use client'

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieLabelRenderProps
} from 'recharts';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useLocale } from 'i18n/LocaleProvider';

interface Position {
  id: number;
  position_name: string;
  position_start_date: string;
  position_end_date: string | null;
  created_at: string;
}

interface PositionCandidate {
  created_at: string;
  candidat_score: number | null;
  source: string;
  candidat_firstname: string;
  candidat_lastname: string;
}

interface AnalyticsData {
  totalCandidates: number;
  averageScore: number;
  medianScore: number;
  daysOpen: number;
  candidatesPerDay: number;
  timelineData: Array<{ date: string; candidates: number; avgScore: number }>;
  scoreDistribution: Array<{ score: string; count: number }>;
  sourceDistribution: Array<{ name: string; value: number; avgScore: number }>;
}

type SupabaseCandidateRow = {
  created_at: string;
  candidat_score: number | null;
  source: string | null;
  candidats: {
    candidat_firstname: string | null;
    candidat_lastname: string | null;
  } | null;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const TIME_FILTERS = ['7d', '30d', '90d', 'all'] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;

  // Type guard for objects with a message string
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return 'An error occurred';
  }
}

const PositionAnalytics: React.FC = () => {
  const { t } = useLocale();

  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [candidates, setCandidates] = useState<PositionCandidate[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const supabase = useSupabaseClient()

  useEffect(() => {
    loadPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      loadCandidates();
    } else {
      setCandidates([]);
      setAnalytics(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPosition, timeFilter]);

  const loadPositions = async () => {
    try {
      if (!session?.user) {
        setError(t('analytics.errors.notLoggedIn'));
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', session.user.id)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error(t('analytics.errors.noCompany'));

      const userCompanyId = userData.company_id;

      const { data, error } = await supabase
        .from('openedpositions')
        .select('id, position_name, position_start_date, position_end_date, created_at')
        .eq('company_id', userCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message || t('analytics.errors.unknownPositionsError'));

      if (!data || data.length === 0) {
        setPositions([]);
        setError(t('analytics.errors.noPositions'));
        return;
      }

      setPositions(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading positions:', err);
      setError(err instanceof Error ? err.message : t('analytics.errors.generic'));
    }
  };

  const loadCandidates = async () => {
    if (!selectedPosition) return;

    setLoading(true);
    try {
      let query = supabase
        .from('position_to_candidat')
        .select(`
          created_at,
          candidat_score,
          source,
          candidats (
            candidat_firstname,
            candidat_lastname
          )
        `)
        .eq('position_id', selectedPosition.id);

      if (timeFilter !== 'all') {
        const days = parseInt(timeFilter.replace('d', ''), 10);
        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - days);
        query = query.gte('created_at', filterDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedCandidates: PositionCandidate[] = ((data as unknown) as SupabaseCandidateRow[]).map(
        (item) => {
          const candidat = item.candidats ? item.candidats : { candidat_firstname: null, candidat_lastname: null };
          return {
            created_at: item.created_at,
            candidat_score: item.candidat_score,
            source: item.source ?? t('analytics.labels.notSpecified'),
            candidat_firstname: candidat.candidat_firstname ?? '',
            candidat_lastname: candidat.candidat_lastname ?? ''
          };
        }
      );

      setCandidates(formattedCandidates);
      setError(null);
      generateAnalytics(formattedCandidates);
    } catch (err: unknown) {
      console.error('Error loading candidates:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = (candidateData: PositionCandidate[]) => {
    if (!selectedPosition || candidateData.length === 0) {
      setAnalytics(null);
      return;
    }

    const validScores = candidateData
      .filter((c) => c.candidat_score !== null)
      .map((c) => c.candidat_score!);
    const totalCandidates = candidateData.length;
    const averageScore =
      validScores.length > 0
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length
        : 0;

    const sortedScores = [...validScores].sort((a, b) => a - b);
    const medianScore =
      sortedScores.length > 0
        ? sortedScores.length % 2 === 0
          ? (sortedScores[sortedScores.length / 2 - 1] +
              sortedScores[sortedScores.length / 2]) /
            2
          : sortedScores[Math.floor(sortedScores.length / 2)]
        : 0;

    const startDate = new Date(selectedPosition.position_start_date);
    const endDate = selectedPosition.position_end_date
      ? new Date(selectedPosition.position_end_date)
      : new Date();
    const daysOpen = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const candidatesPerDay = totalCandidates / daysOpen;

    const timelineMap = new Map<string, { candidates: number; scores: number[] }>();
    candidateData.forEach((candidate) => {
      const date = new Date(candidate.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!timelineMap.has(weekKey)) {
        timelineMap.set(weekKey, { candidates: 0, scores: [] });
      }

      const weekData = timelineMap.get(weekKey)!;
      weekData.candidates++;
      if (candidate.candidat_score !== null) {
        weekData.scores.push(candidate.candidat_score);
      }
    });

    const timelineData = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(undefined, {
          day: '2-digit',
          month: '2-digit'
        }),
        candidates: data.candidates,
        avgScore:
          data.scores.length > 0
            ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            : 0
      }))
      .sort((a, b) => {
        // parse using day/month or locale-specific format might be ambiguous; sort by ISO by reconstructing date
        const aParts = a.date.split(/[^\d]/).map(Number);
        const bParts = b.date.split(/[^\d]/).map(Number);
        // fallback: compare as strings if parsing fails
        return a.date.localeCompare(b.date);
      });

    const scoreDistribution = Array.from({ length: 10 }, (_, i) => {
      const score = i + 1;
      const count = validScores.filter((s) => s === score).length;
      return { score: score.toString(), count };
    });

    const sourceMap = new Map<string, { count: number; scores: number[] }>();
    candidateData.forEach((candidate) => {
      const source = candidate.source || t('analytics.labels.notSpecified');
      if (!sourceMap.has(source)) {
        sourceMap.set(source, { count: 0, scores: [] });
      }
      sourceMap.get(source)!.count++;
      if (candidate.candidat_score !== null) {
        sourceMap.get(source)!.scores.push(candidate.candidat_score);
      }
    });

    const sourceDistribution = Array.from(sourceMap.entries()).map(([name, data]) => ({
      name,
      value: data.count,
      avgScore:
        data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : 0
    }));

    setAnalytics({
      totalCandidates,
      averageScore: Math.round(averageScore * 10) / 10,
      medianScore: Math.round(medianScore * 10) / 10,
      daysOpen,
      candidatesPerDay: Math.round(candidatesPerDay * 10) / 10,
      timelineData,
      scoreDistribution,
      sourceDistribution
    });
  };

  const isPositionOpen = (position: Position) => {
    return !position.position_end_date || new Date(position.position_end_date) > new Date();
  };

  const timeFilterLabel = (filter: TimeFilter) => {
    if (filter === '7d') return t('analytics.timeFilters.7d');
    if (filter === '30d') return t('analytics.timeFilters.30d');
    if (filter === '90d') return t('analytics.timeFilters.90d');
    return t('analytics.timeFilters.all');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header and selection */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('analytics.header.title')}</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <label htmlFor="position-select" className="block text-sm font-medium text-gray-700 mb-2">
              {t('analytics.labels.selectPosition')}
            </label>
            <select
              id="position-select"
              value={selectedPosition?.id ?? ''}
              onChange={(e) => {
                const pos = positions.find(p => p.id === parseInt(e.target.value, 10));
                setSelectedPosition(pos ?? null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('analytics.labels.choosePosition')}</option>
              {positions.map(p => (
                <option key={p.id} value={p.id}>
                  {p.position_name} {isPositionOpen(p) ? ` (${t('analytics.status.open')})` : ` (${t('analytics.status.closed')})`}
                </option>
              ))}
            </select>

            {selectedPosition && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">{t('analytics.labels.period')}:</span>
                {TIME_FILTERS.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      timeFilter === filter
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {timeFilterLabel(filter)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">{t('analytics.error.title')}</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={selectedPosition ? loadCandidates : loadPositions}
              className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              {t('analytics.buttons.retry')}
            </button>
          </div>
        ) : !selectedPosition ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('analytics.placeholders.selectPositionTitle')}</h3>
            <p className="text-gray-500">{t('analytics.placeholders.selectPositionDescription')}</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">{t('analytics.labels.loading')}</p>
          </div>
        ) : !analytics ? (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('analytics.placeholders.noDataTitle')}</h3>
            <p className="text-gray-500">{t('analytics.placeholders.noDataDescription')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('analytics.kpis.totalApplications')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalCandidates}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('analytics.kpis.averageScore')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}/10</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('analytics.kpis.medianScore')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.medianScore}/10</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('analytics.kpis.candidatesPerDay')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.candidatesPerDay}</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('analytics.charts.applicationTrends')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="candidates"
                      stroke="#3B82F6"
                      fill="#93C5FD"
                      name={t('analytics.charts.series.applications')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Score Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('analytics.charts.scoreDistribution')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" name={t('analytics.charts.series.numberOfCandidates')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Source Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('analytics.charts.sourceDistribution')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.sourceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: PieLabelRenderProps) => {
                        const name = props.name ?? t('analytics.labels.unknown');
                        const percent = typeof props.percent === 'number' ? props.percent : 0;
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.sourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Average Score Over Time */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('analytics.charts.averageScoreOverTime')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name={t('analytics.charts.series.averageScore')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Source Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('analytics.tables.sourceDetails')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('analytics.tables.headers.source')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('analytics.tables.headers.numberOfCandidates')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('analytics.tables.headers.averageScore')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('analytics.tables.headers.percentage')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.sourceDistribution.map((source) => (
                      <tr key={source.name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {source.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {source.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {source.avgScore.toFixed(1)}/10
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {((source.value / analytics.totalCandidates) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionAnalytics;
