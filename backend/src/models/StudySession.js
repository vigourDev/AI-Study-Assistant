const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const StudySession = {
  create({ userId, materialId, sessionType }) {
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO study_sessions (id, user_id, material_id, session_type)
       VALUES (?, ?, ?, ?)`
    );
    stmt.run(id, userId, materialId || null, sessionType);
    return this.findById(id);
  },

  findById(id) {
    return db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(id);
  },

  end(id) {
    const session = this.findById(id);
    if (!session) return null;
    const startedAt = new Date(session.started_at);
    const now = new Date();
    const durationMinutes = Math.round((now - startedAt) / 60000);
    db.prepare(
      'UPDATE study_sessions SET ended_at = CURRENT_TIMESTAMP, duration_minutes = ? WHERE id = ?'
    ).run(durationMinutes, id);
    return this.findById(id);
  },

  getByUserId(userId) {
    return db.prepare('SELECT * FROM study_sessions WHERE user_id = ? ORDER BY started_at DESC').all(userId);
  },

  getTotalStudyTime(userId) {
    const result = db.prepare(
      'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE user_id = ?'
    ).get(userId);
    return result.total;
  },

  getWeeklyActivity(userId) {
    return db.prepare(
      `SELECT DATE(started_at) as date, COUNT(*) as sessions, SUM(duration_minutes) as total_minutes
       FROM study_sessions
       WHERE user_id = ? AND started_at >= DATE('now', '-7 days')
       GROUP BY DATE(started_at)
       ORDER BY date`
    ).all(userId);
  },

  getSessionsByType(userId) {
    return db.prepare(
      `SELECT session_type, COUNT(*) as count, SUM(duration_minutes) as total_minutes
       FROM study_sessions
       WHERE user_id = ?
       GROUP BY session_type`
    ).all(userId);
  },
};

module.exports = StudySession;
