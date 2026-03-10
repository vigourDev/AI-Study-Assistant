const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const StudyMaterial = {
  create({ userId, title, originalFilename, fileType, filePath, parsedContent, fileSize }) {
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO study_materials (id, user_id, title, original_filename, file_type, file_path, parsed_content, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(id, userId, title, originalFilename, fileType, filePath, parsedContent, fileSize);
    return this.findById(id);
  },

  findById(id) {
    return db.prepare('SELECT * FROM study_materials WHERE id = ?').get(id);
  },

  findByUserId(userId) {
    return db.prepare('SELECT * FROM study_materials WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  updateSummary(id, summary) {
    db.prepare('UPDATE study_materials SET summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(summary, id);
    return this.findById(id);
  },

  updateParsedContent(id, parsedContent) {
    db.prepare('UPDATE study_materials SET parsed_content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(parsedContent, id);
    return this.findById(id);
  },

  search(userId, query) {
    return db.prepare(
      `SELECT * FROM study_materials
       WHERE user_id = ? AND (title LIKE ? OR parsed_content LIKE ?)
       ORDER BY created_at DESC`
    ).all(userId, `%${query}%`, `%${query}%`);
  },

  delete(id) {
    db.prepare('DELETE FROM study_materials WHERE id = ?').run(id);
  },

  getCount(userId) {
    return db.prepare('SELECT COUNT(*) as count FROM study_materials WHERE user_id = ?').get(userId).count;
  },
};

module.exports = StudyMaterial;
