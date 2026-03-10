import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const [dashRes, resultsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/quizzes/results'),
      ]);
      setData({
        ...dashRes.data,
        allResults: resultsRes.data.results,
      });
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading analytics..." />;
  if (!data) return <p>Failed to load analytics</p>;

  const { stats, weeklyActivity, sessionsByType, recentResults, allResults } = data;

  const scoreOverTime = allResults.slice().reverse().map((r, i) => ({
    name: `Quiz ${i + 1}`,
    score: r.score,
  }));

  const sessionPieData = sessionsByType.map((s) => ({
    name: s.session_type,
    value: s.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Track your learning progress</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.averageScore}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.quizResultsCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quizzes Taken</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.flashcardsCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Flashcards</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalStudyMinutes}m</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Study Time</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score trend */}
        <div className="card">
          <h3 className="font-semibold mb-4">Quiz Score Trend</h3>
          {scoreOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={scoreOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-12 text-center">No quiz results yet</p>
          )}
        </div>

        {/* Weekly activity */}
        <div className="card">
          <h3 className="font-semibold mb-4">Weekly Activity</h3>
          {weeklyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-12 text-center">No activity this week</p>
          )}
        </div>
      </div>

      {/* Session breakdown & Recent results */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Study Sessions by Type</h3>
          {sessionPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sessionPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {sessionPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-12 text-center">No sessions recorded</p>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Recent Quiz Results</h3>
          {recentResults.length > 0 ? (
            <div className="space-y-3">
              {recentResults.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.quiz_title}</p>
                    <p className="text-xs text-gray-500">{new Date(r.completed_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-bold ${r.score >= 70 ? 'text-green-600' : r.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {r.score}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-12 text-center">No quiz results yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
