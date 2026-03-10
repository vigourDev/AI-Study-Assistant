const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const StudyMaterial = require('../models/StudyMaterial');
const { generateQuiz, generateExamPredictions } = require('../services/aiService');

async function createQuiz(req, res) {
  try {
    const { materialId, count } = req.body;
    const material = StudyMaterial.findById(materialId);

    if (!material || material.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (!material.parsed_content) {
      return res.status(422).json({ error: 'No content to generate quiz from' });
    }

    const questions = await generateQuiz(material.parsed_content, count || 5);

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(422).json({ error: 'Failed to generate quiz questions' });
    }

    const quiz = Quiz.create({
      userId: req.user.id,
      materialId,
      title: `Quiz: ${material.title}`,
      questions,
      quizType: 'multiple_choice',
    });

    res.status(201).json({ quiz });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
}

function getQuizzes(req, res) {
  const quizzes = Quiz.findByUserId(req.user.id);
  res.json({ quizzes });
}

function getQuiz(req, res) {
  const quiz = Quiz.findById(req.params.id);
  if (!quiz || quiz.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  res.json({ quiz });
}

function submitQuiz(req, res) {
  try {
    const { answers } = req.body;
    const quiz = Quiz.findById(req.params.id);

    if (!quiz || quiz.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    const questions = quiz.questions;
    let correctAnswers = 0;

    const detailedAnswers = questions.map((q, i) => {
      const userAnswer = answers[i] || '';
      const isCorrect = userAnswer.toUpperCase() === q.correct_answer.toUpperCase();
      if (isCorrect) correctAnswers++;
      return {
        question: q.question,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation || '',
      };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);

    const result = QuizResult.create({
      userId: req.user.id,
      quizId: quiz.id,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      answers: detailedAnswers,
    });

    res.json({ result });
  } catch (err) {
    console.error('Quiz submit error:', err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
}

function getQuizResults(req, res) {
  const results = QuizResult.findByUserId(req.user.id);
  res.json({ results });
}

function deleteQuiz(req, res) {
  const quiz = Quiz.findById(req.params.id);
  if (!quiz || quiz.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  Quiz.delete(req.params.id);
  res.json({ message: 'Quiz deleted' });
}

async function predictExam(req, res) {
  try {
    const { materialId, count } = req.body;
    const material = StudyMaterial.findById(materialId);

    if (!material || material.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (!material.parsed_content) {
      return res.status(422).json({ error: 'No content to generate predictions from' });
    }

    const predictions = await generateExamPredictions(material.parsed_content, count || 5);
    res.json({ predictions });
  } catch (err) {
    console.error('Exam prediction error:', err);
    res.status(500).json({ error: 'Failed to generate exam predictions' });
  }
}

module.exports = {
  createQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  predictExam,
};
