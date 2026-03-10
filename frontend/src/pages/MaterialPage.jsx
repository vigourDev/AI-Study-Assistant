import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, BookOpen, Brain, Sparkles, Target, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MaterialPage() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [summary, setSummary] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    loadMaterial();
  }, [id]);

  async function loadMaterial() {
    try {
      const { data } = await api.get(`/materials/${id}`);
      setMaterial(data.material);
      if (data.material.summary) setSummary(data.material.summary);
    } catch {
      toast.error('Failed to load material');
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarize() {
    setSummarizing(true);
    try {
      const { data } = await api.post(`/materials/${id}/summarize`);
      setSummary(data.summary);
      setActiveTab('summary');
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to summarize');
    } finally {
      setSummarizing(false);
    }
  }

  async function handleGenerateFlashcards() {
    setGeneratingCards(true);
    try {
      await api.post('/flashcards/generate', { materialId: id, count: 10 });
      toast.success('Flashcards generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate flashcards');
    } finally {
      setGeneratingCards(false);
    }
  }

  async function handleGenerateQuiz() {
    setGeneratingQuiz(true);
    try {
      const { data } = await api.post('/quizzes/generate', { materialId: id, count: 5 });
      toast.success('Quiz generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  }

  async function handlePredictExam() {
    setPredicting(true);
    try {
      const { data } = await api.post('/quizzes/predict', { materialId: id, count: 5 });
      setPredictions(data.predictions);
      setActiveTab('predictions');
      toast.success('Exam predictions generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to predict');
    } finally {
      setPredicting(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading material..." />;
  if (!material) return <p>Material not found</p>;

  const tabs = [
    { key: 'content', label: 'Content' },
    { key: 'summary', label: 'Summary', disabled: !summary },
    { key: 'predictions', label: 'Exam Predictions', disabled: !predictions },
  ];

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{material.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {material.original_filename} • {new Date(material.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* AI Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={handleSummarize}
          disabled={summarizing}
          className="card flex flex-col items-center gap-2 py-4 hover:border-primary-400 transition-colors cursor-pointer text-center"
        >
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <span className="text-sm font-medium">{summarizing ? 'Summarizing...' : 'Generate Summary'}</span>
        </button>
        <button
          onClick={handleGenerateFlashcards}
          disabled={generatingCards}
          className="card flex flex-col items-center gap-2 py-4 hover:border-primary-400 transition-colors cursor-pointer text-center"
        >
          <BookOpen className="h-6 w-6 text-green-500" />
          <span className="text-sm font-medium">{generatingCards ? 'Generating...' : 'Generate Flashcards'}</span>
        </button>
        <button
          onClick={handleGenerateQuiz}
          disabled={generatingQuiz}
          className="card flex flex-col items-center gap-2 py-4 hover:border-primary-400 transition-colors cursor-pointer text-center"
        >
          <Brain className="h-6 w-6 text-purple-500" />
          <span className="text-sm font-medium">{generatingQuiz ? 'Generating...' : 'Generate Quiz'}</span>
        </button>
        <button
          onClick={handlePredictExam}
          disabled={predicting}
          className="card flex flex-col items-center gap-2 py-4 hover:border-primary-400 transition-colors cursor-pointer text-center"
        >
          <Target className="h-6 w-6 text-red-500" />
          <span className="text-sm font-medium">{predicting ? 'Predicting...' : 'Predict Exam'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && setActiveTab(tab.key)}
            disabled={tab.disabled}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        {activeTab === 'content' && (
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {material.parsed_content || 'No content extracted'}
          </div>
        )}
        {activeTab === 'summary' && summary && (
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {summary}
          </div>
        )}
        {activeTab === 'predictions' && predictions && (
          <div className="space-y-4">
            {predictions.map((p, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                    {p.type}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                    {p.difficulty}
                  </span>
                </div>
                <p className="font-medium mb-2">{p.question}</p>
                {p.key_points && (
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {p.key_points.map((kp, j) => <li key={j}>{kp}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
