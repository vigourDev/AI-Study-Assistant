import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, RotateCcw, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function StudyFlashcardsPage() {
  const { materialId } = useParams();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    loadCards();
  }, [materialId]);

  async function loadCards() {
    try {
      const { data } = await api.get(`/flashcards/material/${materialId}`);
      setCards(data.flashcards);
    } catch {
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(correct) {
    try {
      await api.patch(`/flashcards/${cards[currentIndex].id}/review`, { correct });
      setStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
      }));
      nextCard();
    } catch {
      toast.error('Failed to record review');
    }
  }

  function nextCard() {
    setFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function prevCard() {
    setFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  function restart() {
    setCurrentIndex(0);
    setFlipped(false);
    setStats({ correct: 0, incorrect: 0 });
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading flashcards..." />;

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No flashcards found for this material</p>
        <Link to={`/materials/${materialId}`} className="btn-primary">Generate Flashcards</Link>
      </div>
    );
  }

  const card = cards[currentIndex];
  const isComplete = currentIndex === cards.length - 1 && (stats.correct + stats.incorrect) === cards.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/flashcards" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> Back to Flashcards
      </Link>

      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <div className="flex gap-3">
          <span className="text-green-600">✓ {stats.correct}</span>
          <span className="text-red-600">✗ {stats.incorrect}</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="card min-h-[300px] flex flex-col items-center justify-center cursor-pointer select-none hover:shadow-md transition-shadow"
      >
        <p className="text-xs text-gray-400 mb-4">{flipped ? 'ANSWER' : 'QUESTION'}</p>
        <p className="text-lg text-center font-medium px-4">
          {flipped ? card.back : card.front}
        </p>
        <p className="text-xs text-gray-400 mt-6">Click to flip</p>
        {card.difficulty && (
          <span className={`mt-2 text-xs px-2 py-0.5 rounded ${
            card.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            card.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {card.difficulty}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="btn-secondary p-2 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {flipped && (
          <>
            <button
              onClick={() => handleReview(false)}
              className="btn-danger py-2 px-6 inline-flex items-center gap-2"
            >
              <X className="h-4 w-4" /> Incorrect
            </button>
            <button
              onClick={() => handleReview(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg inline-flex items-center gap-2"
            >
              <Check className="h-4 w-4" /> Correct
            </button>
          </>
        )}

        <button
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
          className="btn-secondary p-2 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {isComplete && (
        <div className="card text-center py-8">
          <h2 className="text-xl font-bold mb-2">Session Complete!</h2>
          <p className="text-gray-500 mb-1">
            Score: {stats.correct} / {cards.length} ({Math.round((stats.correct / cards.length) * 100)}%)
          </p>
          <button onClick={restart} className="btn-primary mt-4 inline-flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Study Again
          </button>
        </div>
      )}
    </div>
  );
}
