import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function TakeQuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  async function loadQuiz() {
    try {
      const { data } = await api.get(`/quizzes/${id}`);
      setQuiz(data.quiz);
      setAnswers(new Array(data.quiz.questions.length).fill(''));
    } catch {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(qIndex, answer) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[qIndex] = answer;
      return copy;
    });
  }

  async function handleSubmit() {
    if (answers.some((a) => !a)) {
      return toast.error('Please answer all questions');
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/quizzes/${id}/submit`, { answers });
      setResult(data.result);
      toast.success(`Quiz completed! Score: ${data.result.score}%`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading quiz..." />;
  if (!quiz) return <p>Quiz not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/quizzes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> Back to Quizzes
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{quiz.questions.length} questions</p>
      </div>

      {result ? (
        /* Results view */
        <div className="space-y-6">
          <div className="card text-center py-8">
            <h2 className="text-3xl font-bold mb-2">{result.score}%</h2>
            <p className="text-gray-500">
              {result.correct_answers} of {result.total_questions} correct
            </p>
          </div>

          {result.answers.map((a, i) => (
            <div key={i} className={`card border-l-4 ${a.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <div className="flex items-start gap-3">
                {a.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium mb-2">Q{i + 1}: {a.question}</p>
                  {!a.isCorrect && (
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                      Your answer: {a.userAnswer}
                    </p>
                  )}
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                    Correct answer: {a.correctAnswer}
                  </p>
                  {a.explanation && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {a.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <Link to="/quizzes" className="btn-secondary">Back to Quizzes</Link>
            <button onClick={() => { setResult(null); setAnswers(new Array(quiz.questions.length).fill('')); }} className="btn-primary">
              Retry Quiz
            </button>
          </div>
        </div>
      ) : (
        /* Quiz view */
        <div className="space-y-6">
          {quiz.questions.map((q, i) => (
            <div key={i} className="card">
              <p className="font-medium mb-4">
                <span className="text-primary-600 mr-2">Q{i + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const letter = opt.charAt(0);
                  const selected = answers[i] === letter;
                  return (
                    <button
                      key={opt}
                      onClick={() => selectAnswer(i, letter)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm ${
                        selected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-3 text-lg"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}
    </div>
  );
}
