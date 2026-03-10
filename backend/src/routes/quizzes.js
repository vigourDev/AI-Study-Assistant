const express = require('express');
const authenticate = require('../middleware/auth');
const {
  createQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  predictExam,
} = require('../controllers/quizController');

const router = express.Router();

router.use(authenticate);

router.post('/generate', createQuiz);
router.get('/', getQuizzes);
router.get('/results', getQuizResults);
router.get('/:id', getQuiz);
router.post('/:id/submit', submitQuiz);
router.delete('/:id', deleteQuiz);
router.post('/predict', predictExam);

module.exports = router;
