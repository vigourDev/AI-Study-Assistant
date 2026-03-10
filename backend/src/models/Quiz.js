const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const Quiz = {
  create({ userId, materialId, title, questions, quizType }) {
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO quizzes (id, user_id, material_id, title, questions, quiz_type)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    stmt.run(id, userId, materialId, title, JSON.stringify(questions), quizType || 'multiple_choice');
    return this.findById(id);
  },

  findById(id) {
    const row = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    if (row) row.questions = JSON.parse(row.questions);
    return row;
  },

  findByUserId(userId) {
    const rows = db.prepare('SELECT * FROM quizzes WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    return rows.map((r) => ({ ...r, questions: JSON.parse(r.questions) }));
  },

  findByMaterialId(materialId) {
    const rows = db.prepare('SELECT * FROM quizzes WHERE material_id = ? ORDER BY created_at DESC').all(materialId);
    return rows.map((r) => ({ ...r, questions: JSON.parse(r.questions) }));
  },

  delete(id) {
    db.prepare('DELETE FROM quizzes WHERE id = ?').run(id);
  },

  getCount(userId) {
    return db.prepare('SELECT COUNT(*) as count FROM quizzes WHERE user_id = ?').get(userId).count;
  },
};

module.exports = Quiz;
