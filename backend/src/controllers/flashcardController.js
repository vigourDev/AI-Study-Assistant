const Flashcard = require('../models/Flashcard');
const StudyMaterial = require('../models/StudyMaterial');
const { generateFlashcards } = require('../services/aiService');
const { generateFlashcardPDF } = require('../services/pdfGenerator');

async function createFlashcards(req, res) {
  try {
    const { materialId, count } = req.body;
    const material = StudyMaterial.findById(materialId);

    if (!material || material.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (!material.parsed_content) {
      return res.status(422).json({ error: 'No content to generate flashcards from' });
    }

    const aiCards = await generateFlashcards(material.parsed_content, count || 10);

    const cards = Array.isArray(aiCards)
      ? aiCards.map((c) => ({
          userId: req.user.id,
          materialId,
          front: c.front,
          back: c.back,
          difficulty: c.difficulty || 'medium',
        }))
      : [];

    if (cards.length === 0) {
      return res.status(422).json({ error: 'Failed to generate flashcards' });
    }

    const flashcards = Flashcard.createMany(cards);
    res.status(201).json({ flashcards });
  } catch (err) {
    console.error('Flashcard generation error:', err);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
}

function getFlashcards(req, res) {
  const flashcards = Flashcard.findByUserId(req.user.id);
  res.json({ flashcards });
}

function getFlashcardsByMaterial(req, res) {
  const material = StudyMaterial.findById(req.params.materialId);
  if (!material || material.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Material not found' });
  }
  const flashcards = Flashcard.findByMaterialId(req.params.materialId);
  res.json({ flashcards });
}

function reviewFlashcard(req, res) {
  const { correct } = req.body;
  const card = Flashcard.findById(req.params.id);

  if (!card || card.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  const updated = Flashcard.updateReview(req.params.id, correct);
  res.json({ flashcard: updated });
}

function deleteFlashcard(req, res) {
  const card = Flashcard.findById(req.params.id);
  if (!card || card.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }
  Flashcard.delete(req.params.id);
  res.json({ message: 'Flashcard deleted' });
}

async function exportFlashcardsPDF(req, res) {
  try {
    const material = StudyMaterial.findById(req.params.materialId);
    if (!material || material.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const flashcards = Flashcard.findByMaterialId(req.params.materialId);
    if (flashcards.length === 0) {
      return res.status(404).json({ error: 'No flashcards found for this material' });
    }

    const pdfBuffer = await generateFlashcardPDF(flashcards, material.title);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="flashcards-${material.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: 'Failed to export flashcards' });
  }
}

module.exports = {
  createFlashcards,
  getFlashcards,
  getFlashcardsByMaterial,
  reviewFlashcard,
  deleteFlashcard,
  exportFlashcardsPDF,
};
