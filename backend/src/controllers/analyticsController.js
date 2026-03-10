const StudyMaterial = require('../models/StudyMaterial');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const StudySession = require('../models/StudySession');

function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;

    const materialsCount = StudyMaterial.getCount(userId);
    const flashcardsCount = Flashcard.getCount(userId);
    const quizzesCount = Quiz.getCount(userId);
    const quizResultsCount = QuizResult.getCount(userId);
    const avgScore = QuizResult.getAverageScore(userId);
    const totalStudyTime = StudySession.getTotalStudyTime(userId);
    const weeklyActivity = StudySession.getWeeklyActivity(userId);
    const sessionsByType = StudySession.getSessionsByType(userId);
    const recentResults = QuizResult.getRecentResults(userId, 5);

    res.json({
      stats: {
        materialsCount,
        flashcardsCount,
        quizzesCount,
        quizResultsCount,
        averageScore: Math.round(avgScore * 10) / 10,
        totalStudyMinutes: totalStudyTime,
      },
      weeklyActivity,
      sessionsByType,
      recentResults,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

function startSession(req, res) {
  try {
    const { materialId, sessionType } = req.body;
    const session = StudySession.create({
      userId: req.user.id,
      materialId,
      sessionType: sessionType || 'study',
    });
    res.status(201).json({ session });
  } catch (err) {
    console.error('Session start error:', err);
    res.status(500).json({ error: 'Failed to start session' });
  }
}

function endSession(req, res) {
  try {
    const session = StudySession.findById(req.params.id);
    if (!session || session.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const ended = StudySession.end(req.params.id);
    res.json({ session: ended });
  } catch (err) {
    console.error('Session end error:', err);
    res.status(500).json({ error: 'Failed to end session' });
  }
}

module.exports = { getDashboardStats, startSession, endSession };
