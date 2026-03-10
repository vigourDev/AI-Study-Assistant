import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Brain, Play, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function loadQuizzes() {
    try {
      const { data } = await api.get('/quizzes');
      setQuizzes(data.quizzes);
    } catch {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      toast.success('Quiz deleted');
    } catch {
      toast.error('Failed to delete quiz');
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading quizzes..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-gray-500 dark:text-gray-400">Test your knowledge</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="card text-center py-12">
          <Brain className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No quizzes yet</p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((q) => (
            <div key={q.id} className="card space-y-3">
              <h3 className="font-semibold truncate">{q.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {q.questions.length} questions • {q.quiz_type}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(q.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Link
                  to={`/quizzes/${q.id}`}
                  className="btn-primary text-sm py-1.5 px-3 inline-flex items-center gap-1"
                >
                  <Play className="h-4 w-4" /> Take Quiz
                </Link>
                <button
                  onClick={() => handleDelete(q.id)}
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
  );
}
