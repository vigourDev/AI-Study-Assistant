import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Download, Eye } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function FlashcardsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    try {
      const { data } = await api.get('/materials');
      // For each material, check if it has flashcards
      const mats = data.materials;
      const withCards = await Promise.all(
        mats.map(async (m) => {
          try {
            const res = await api.get(`/flashcards/material/${m.id}`);
            return { ...m, flashcardCount: res.data.flashcards.length };
          } catch {
            return { ...m, flashcardCount: 0 };
          }
        })
      );
      setMaterials(withCards);
    } catch {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPDF(materialId) {
    try {
      const response = await api.get(`/flashcards/material/${materialId}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `flashcards-${materialId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to export PDF. Generate flashcards first.');
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading flashcards..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <p className="text-gray-500 dark:text-gray-400">Study and review your flashcards</p>
      </div>

      {materials.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No materials yet</p>
          <Link to="/upload" className="btn-primary">Upload Material</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {materials.map((m) => (
            <div key={m.id} className="card space-y-3">
              <h3 className="font-semibold truncate">{m.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {m.flashcardCount} flashcard{m.flashcardCount !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                {m.flashcardCount > 0 ? (
                  <>
                    <Link
                      to={`/flashcards/study/${m.id}`}
                      className="btn-primary text-sm py-1.5 px-3 inline-flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" /> Study
                    </Link>
                    <button
                      onClick={() => handleExportPDF(m.id)}
                      className="btn-secondary text-sm py-1.5 px-3 inline-flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" /> Export PDF
                    </button>
                  </>
                ) : (
                  <Link to={`/materials/${m.id}`} className="btn-secondary text-sm py-1.5 px-3">
                    Generate Flashcards
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
