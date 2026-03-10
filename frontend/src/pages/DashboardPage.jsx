import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FileText,
  BookOpen,
  Brain,
  TrendingUp,
  Upload,
  Clock,
  Search,
  Trash2,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [materials, setMaterials] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [matRes, statsRes] = await Promise.all([
        api.get('/materials'),
        api.get('/analytics/dashboard'),
      ]);
      setMaterials(matRes.data.materials);
      setStats(statsRes.data.stats);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const { data } = await api.get(`/materials/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.materials);
    } catch {
      toast.error('Search failed');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this material and all related flashcards/quizzes?')) return;
    try {
      await api.delete(`/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      toast.success('Material deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  const statCards = [
    { label: 'Materials', value: stats?.materialsCount || 0, icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Flashcards', value: stats?.flashcardsCount || 0, icon: BookOpen, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Quizzes', value: stats?.quizzesCount || 0, icon: Brain, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Avg Score', value: `${stats?.averageScore || 0}%`, icon: TrendingUp, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Study Time', value: `${stats?.totalStudyMinutes || 0}m`, icon: Clock, color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
  ];

  const displayMaterials = searchResults || materials;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your study materials</p>
        </div>
        <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Material
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value) setSearchResults(null);
            }}
            className="input-field pl-10"
            placeholder="Search your notes..."
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {/* Materials list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          {searchResults ? `Search Results (${searchResults.length})` : 'Your Materials'}
        </h2>
        {displayMaterials.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchResults ? 'No results found' : 'No materials yet. Upload your first study material!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {displayMaterials.map((m) => (
              <div key={m.id} className="card flex items-center justify-between">
                <Link to={`/materials/${m.id}`} className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{m.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {m.original_filename} • {(m.file_size / 1024).toFixed(1)}KB •{' '}
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  <Link to={`/materials/${m.id}`} className="btn-secondary text-sm py-1 px-3">
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
