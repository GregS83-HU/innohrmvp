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
  dailyMetrics: Array<{
    metric_date: string;
    total_sessions_completed: number;
    avg_overall_happiness: number;
    completion_rate: number;
    avg_positive_emotions: number;
    avg_engagement: number;
    avg_relationships: number;
    avg_meaning: number;
    avg_accomplishment: number;
    avg_work_life_balance: number;
  }>;
  period: string;
  companyId?: number;
  companyName?: string;
}

const HRDashboard = () => {
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
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated - please log in again');
        } else if (response.status === 403) {
          throw new Error('Access denied - no company associated with your account');
        }
        throw new Error('Error loading data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, session, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getHappinessLevel = (score: number) => {
    if (score >= 8) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', icon: Smile };
    if (score >= 6) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Meh };
    return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50', icon: Frown };
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const permaLabels = {
    positive: 'Positive Emotions',
    engagement: 'Engagement',
    relationships: 'Relationships',
    meaning: 'Work Meaning',
    accomplishment: 'Accomplishment',
    work_life_balance: 'Work-Life Balance'
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const recommendations = {
    positive: "Organize team events, celebrate successes, improve recognition",
    engagement: "Offer challenging projects, skill development, increased autonomy",
    relationships: "Team building, communication training, collaboration spaces",
    meaning: "Clarify mission, show impact, align with personal values",
    accomplishment: "Clear goals, regular feedback, growth opportunities",
    work_life_balance: "Flexible hours, remote work, disconnection policies"
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to access the HR dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <LogIn className="w-4 h-4" />
            Log In
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
          <span className="text-lg text-gray-600">Loading data...</span>
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
            <span className="font-semibold">Error</span>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const happinessLevel = getHappinessLevel(data.summary.avgHappiness);
  const HappinessIcon = happinessLevel.icon;

  const trendData = data.dailyMetrics.map(item => ({
    date: new Date(item.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    happiness: item.avg_overall_happiness,
    participation: item.total_sessions_completed,
    completion: item.completion_rate
  }));

  const permaData = Object.entries(data.permaAverages).map(([key, value]) => ({
    dimension: permaLabels[key as keyof typeof permaLabels],
    score: value,
    fullMark: 10
  }));

  const pieData = Object.entries(data.permaAverages).map(([key, value], index) => ({
    name: permaLabels[key as keyof typeof permaLabels],
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
                HR Wellbeing Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Anonymous workplace happiness analytics • {data.period}
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
                  {selectedPeriod} days
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
                        {period} days
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
                Refresh
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
                <p className="text-sm text-gray-600">Average Score</p>
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
                <p className="text-sm text-gray-600">Participations</p>
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
                <p className="text-sm text-gray-600">Strongest Area</p>
                <p className="text-sm font-semibold text-gray-900">
                  {Object.entries(data.permaAverages).sort(([,a],[,b])=>b-a)[0]
                    ? permaLabels[Object.entries(data.permaAverages).sort(([,a],[,b])=>b-a)[0][0] as keyof typeof permaLabels]
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
                <p className="text-sm text-gray-600">Area for Improvement</p>
                <p className="text-sm font-semibold text-gray-900">
                  {data.areasForImprovement[0]
                    ? permaLabels[data.areasForImprovement[0].area as keyof typeof permaLabels]
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
          {/* Temporal Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellbeing Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis domain={[0,10]} stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor:'#fff', border:'1px solid #e5e7eb', borderRadius:'8px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                    formatter={(value:number)=>[value?.toFixed(1),'Average Score']}
                  />
                  <Line type="monotone" dataKey="happiness" stroke="#3B82F6" strokeWidth={3} dot={{ fill:'#3B82F6', strokeWidth:2, r:4 }} activeDot={{ r:6, fill:'#1D4ED8' }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PERMA Radar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PERMA-W Analysis</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={permaData}>
                  <PolarGrid stroke="#e5e7eb"/>
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize:11 }}/>
                  <PolarRadiusAxis angle={90} domain={[0,10]} tick={{ fontSize:10 }} tickCount={6}/>
                  <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} dot={{ fill:'#3B82F6', strokeWidth:2, r:4 }}/>
                  <Tooltip formatter={(value:number)=>[value?.toFixed(1),'Score']} contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px'}}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* PERMA Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Domain Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, index)=><Cell key={`cell-${index}`} fill={entry.color}/>)}
                  </Pie>
                  <Tooltip formatter={(value:number)=>[value?.toFixed(1),'Score']}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Domain Comparison */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={permaData} margin={{ left:20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="dimension" stroke="#6b7280" fontSize={11} angle={-45} textAnchor="end" height={80}/>
                  <YAxis domain={[0,10]} stroke="#6b7280" fontSize={12}/>
                  <Tooltip formatter={(value:number)=>[value?.toFixed(1),'Score']} contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px'}}/>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.areasForImprovement.slice(0,3).map((area)=>(
              <div key={area.area} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600"/>
                  <h4 className="font-semibold text-red-800">{permaLabels[area.area as keyof typeof permaLabels]}</h4>
                  <span className="text-sm text-red-600">({area.score.toFixed(1)}/10)</span>
                </div>
                <p className="text-sm text-red-700">{recommendations[area.area as keyof typeof recommendations]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              <strong>Privacy:</strong> All data is fully anonymized. No personal information is stored or displayed.
            </p>
            <p className="text-xs text-gray-500 mt-1">Last update: {new Date().toLocaleString('en-US')}</p>
            {data.companyName && (
              <p className="text-xs text-blue-600 mt-1">Data filtered for: {data.companyName}</p>
            )}
          </div>
          <button
            onClick={()=>alert('Export functionality to be implemented')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4"/>
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;