'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  BarChart3, 
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  ChevronDown,
  Smile,
  Meh,
  Frown,
  Lock,
  LogIn
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useLocale } from 'i18n/LocaleProvider';

interface DashboardData {
  summary: {
    totalSessions: number;
    avgHappiness: number;
    participationTrend: number;
  };
  permaAverages: {
    positive: number;
    engagement: number;
    relationships: number;
    meaning: number;
    accomplishment: number;
    work_life_balance: number;
  };
  areasForImprovement: Array<{
    area: string;
    score: number;
  }>;
  period: string;
  companyId?: number;
  companyName?: string;
}

type PermaKey = keyof DashboardData['permaAverages'];

const HRDashboard = () => {
  const { t, locale } = useLocale();
  
  // Debug: Check if translations are working
  console.log('Dashboard - Current locale:', locale);
  console.log('Dashboard - Translation test (simple):', t('dashboard.title'));
  console.log('Dashboard - Translation test (nested):', t('dashboard.charts.permaAnalysis'));
  console.log('Dashboard - Translation test (with vars):', t('dashboard.period.days', { count: '30' }));
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const session = useSession()
  const supabase = useSupabaseClient()

  const fetchData = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      const userId = session.user.id
      
      const response = await fetch(`/api/happiness/dashboard?days=${selectedPeriod}&user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${currentSession?.access_token}`,
          'Content-Type': 'application/json',
          'x-lang': locale
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t('dashboard.errors.notAuthenticated'));
        } else if (response.status === 403) {
          throw new Error(t('dashboard.errors.accessDenied'));
        }
        throw new Error(t('dashboard.errors.loadingData'));
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dashboard.errors.unknown'));
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, session, supabase, locale, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getHappinessLevel = (score: number) => {
    if (score >= 8) return { 
      label: t('dashboard.levels.excellent'), 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      icon: Smile 
    };
    if (score >= 6) return { 
      label: t('dashboard.levels.good'), 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      icon: Meh 
    };
    return { 
      label: t('dashboard.levels.needsImprovement'), 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      icon: Frown 
    };
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const permaLabels: Record<PermaKey, string> = {
    positive: t('dashboard.perma.positive'),
    engagement: t('dashboard.perma.engagement'),
    relationships: t('dashboard.perma.relationships'),
    meaning: t('dashboard.perma.meaning'),
    accomplishment: t('dashboard.perma.accomplishment'),
    work_life_balance: t('dashboard.perma.workLifeBalance')
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const recommendations: Record<PermaKey, string> = {
    positive: t('dashboard.recommendations.positive'),
    engagement: t('dashboard.recommendations.engagement'),
    relationships: t('dashboard.recommendations.relationships'),
    meaning: t('dashboard.recommendations.meaning'),
    accomplishment: t('dashboard.recommendations.accomplishment'),
    work_life_balance: t('dashboard.recommendations.workLifeBalance')
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.auth.required')}</h2>
          <p className="text-gray-600 mb-6">
            {t('dashboard.auth.description')}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <LogIn className="w-4 h-4" />
            {t('dashboard.auth.login')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">{t('dashboard.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">{t('dashboard.error')}</span>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const happinessLevel = getHappinessLevel(data.summary.avgHappiness);
  const HappinessIcon = happinessLevel.icon;

  const permaData = Object.entries(data.permaAverages).map(([key, value]) => ({
    dimension: permaLabels[key as PermaKey],
    score: value,
    fullMark: 10
  }));

  const pieData = Object.entries(data.permaAverages).map(([key, value], index) => ({
    name: permaLabels[key as PermaKey],
    value: value,
    color: colors[index]
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                {t('dashboard.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('dashboard.subtitle')} • {data.period}
              </p>
              {data.companyName && (
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {data.companyName}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Period Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  {t('dashboard.period.days', { count: selectedPeriod })}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {['7', '30', '90', '365'].map(period => (
                      <button
                        key={period}
                        onClick={() => {
                          setSelectedPeriod(period);
                          setIsFilterOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {t('dashboard.period.days', { count: period })}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t('dashboard.refresh')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Average Score */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.metrics.avgScore')}</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.avgHappiness}/10</p>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${happinessLevel.bg} ${happinessLevel.color} mt-2`}>
                  <HappinessIcon className="w-3 h-3" />
                  {happinessLevel.label}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Participations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.metrics.participations')}</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.totalSessions}</p>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(data.summary.participationTrend)}
                  <span className="text-xs text-gray-600">
                    {data.summary.participationTrend > 0 ? '+' : ''}{data.summary.participationTrend}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Strongest Area */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.metrics.strongestArea')}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {Object.entries(data.permaAverages).sort(([,a],[,b])=>b-a)[0]
                    ? permaLabels[Object.entries(data.permaAverages).sort(([,a],[,b])=>b-a)[0][0] as PermaKey]
                    : 'N/A'}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {Object.entries(data.permaAverages).sort(([,a],[,b])=>b-a)[0]?.[1].toFixed(1) || 'N/A'}/10
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Area for Improvement */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.metrics.improvementArea')}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {data.areasForImprovement[0]
                    ? permaLabels[data.areasForImprovement[0].area as PermaKey]
                    : 'N/A'}
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {data.areasForImprovement[0]?.score.toFixed(1) || 'N/A'}/10
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* PERMA Radar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.charts.permaAnalysis')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={permaData}>
                  <PolarGrid stroke="#e5e7eb"/>
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize:11 }}/>
                  <PolarRadiusAxis angle={90} domain={[0,10]} tick={{ fontSize:10 }} tickCount={6}/>
                  <Radar name={t('dashboard.charts.score')} dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} dot={{ fill:'#3B82F6', strokeWidth:2, r:4 }}/>
                  <Tooltip formatter={(value:number)=>[value?.toFixed(1), t('dashboard.charts.score')]} contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px'}}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* PERMA Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.charts.distribution')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={40} 
                  outerRadius={80} 
                  paddingAngle={2} 
                  dataKey="value" 
                  label={({ name, value }) => `${name}\n${value?.toFixed(1)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value?.toFixed(1), t('dashboard.charts.score')]} />
              </PieChart>
              </ResponsiveContainer>  
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Domain Comparison */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.charts.comparison')}</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={permaData} margin={{ left:20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="dimension" stroke="#6b7280" fontSize={11} angle={-45} textAnchor="end" height={80}/>
                  <YAxis domain={[0,10]} stroke="#6b7280" fontSize={12}/>
                  <Tooltip formatter={(value:number)=>[value?.toFixed(1), t('dashboard.charts.score')]} contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px'}}/>
                  <Bar dataKey="score" radius={[4,4,0,0]}>
                    {permaData.map((entry,index)=><Cell key={`cell-${index}`} fill={colors[index]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.actions.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.areasForImprovement.slice(0,3).map((area)=>(
              <div key={area.area} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600"/>
                  <h4 className="font-semibold text-red-800">{permaLabels[area.area as PermaKey]}</h4>
                  <span className="text-sm text-red-600">({area.score.toFixed(1)}/10)</span>
                </div>
                <p className="text-sm text-red-700">{recommendations[area.area as PermaKey]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              <strong>{t('dashboard.footer.privacy')}:</strong> {t('dashboard.footer.privacyText')}
            </p>
            <p className="text-xs text-gray-500 mt-1">{t('dashboard.footer.lastUpdate')}: {new Date().toLocaleString(locale === 'hu' ? 'hu-HU' : 'en-US')}</p>
            {data.companyName && (
              <p className="text-xs text-blue-600 mt-1">{t('dashboard.footer.filteredFor')}: {data.companyName}</p>
            )}
          </div>
          <button
            onClick={()=>alert(t('dashboard.footer.exportTodo'))}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4"/>
            {t('dashboard.footer.export')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;