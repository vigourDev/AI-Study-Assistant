const express = require('express');
const authenticate = require('../middleware/auth');
const {
  createFlashcards,
  getFlashcards,
  getFlashcardsByMaterial,
  reviewFlashcard,
  deleteFlashcard,
  exportFlashcardsPDF,
} = require('../controllers/flashcardController');

const router = express.Router();

router.use(authenticate);

router.post('/generate', createFlashcards);
router.get('/', getFlashcards);
router.get('/material/:materialId', getFlashcardsByMaterial);
router.get('/material/:materialId/export', exportFlashcardsPDF);
router.patch('/:id/review', reviewFlashcard);
router.delete('/:id', deleteFlashcard);

module.exports = router;
