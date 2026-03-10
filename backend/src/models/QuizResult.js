const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const QuizResult = {
  create({ userId, quizId, score, totalQuestions, correctAnswers, answers }) {
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO quiz_results (id, user_id, quiz_id, score, total_questions, correct_answers, answers)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(id, userId, quizId, score, totalQuestions, correctAnswers, JSON.stringify(answers));
    return this.findById(id);
  },

  findById(id) {
    const row = db.prepare('SELECT * FROM quiz_results WHERE id = ?').get(id);
    if (row) row.answers = JSON.parse(row.answers);
    return row;
  },

  findByUserId(userId) {
    const rows = db.prepare(
      `SELECT qr.*, q.title as quiz_title
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       WHERE qr.user_id = ?
       ORDER BY qr.completed_at DESC`
    ).all(userId);
    return rows.map((r) => ({ ...r, answers: JSON.parse(r.answers) }));
  },

  findByQuizId(quizId) {
    const rows = db.prepare('SELECT * FROM quiz_results WHERE quiz_id = ? ORDER BY completed_at DESC').all(quizId);
    return rows.map((r) => ({ ...r, answers: JSON.parse(r.answers) }));
  },

  getAverageScore(userId) {
    const result = db.prepare('SELECT AVG(score) as avg_score FROM quiz_results WHERE user_id = ?').get(userId);
    return result?.avg_score || 0;
  },

  getRecentResults(userId, limit = 10) {
    const rows = db.prepare(
      `SELECT qr.*, q.title as quiz_title
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       WHERE qr.user_id = ?
       ORDER BY qr.completed_at DESC
       LIMIT ?`
    ).all(userId, limit);
    return rows.map((r) => ({ ...r, answers: JSON.parse(r.answers) }));
  },

  getCount(userId) {
    return db.prepare('SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ?').get(userId).count;
  },
};

module.exports = QuizResult;
