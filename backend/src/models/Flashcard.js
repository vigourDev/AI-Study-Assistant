const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const Flashcard = {
  createMany(cards) {
    const stmt = db.prepare(
      `INSERT INTO flashcards (id, user_id, material_id, front, back, difficulty)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const insertMany = db.transaction((items) => {
      for (const card of items) {
        stmt.run(uuidv4(), card.userId, card.materialId, card.front, card.back, card.difficulty || 'medium');
      }
    });
    insertMany(cards);
    return this.findByMaterialId(cards[0]?.materialId);
  },

  findById(id) {
    return db.prepare('SELECT * FROM flashcards WHERE id = ?').get(id);
  },

  findByUserId(userId) {
    return db.prepare('SELECT * FROM flashcards WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  findByMaterialId(materialId) {
    return db.prepare('SELECT * FROM flashcards WHERE material_id = ? ORDER BY created_at DESC').all(materialId);
  },

  updateReview(id, correct) {
    const card = this.findById(id);
    if (!card) return null;
    const timesCorrect = correct ? card.times_correct + 1 : card.times_correct;
    db.prepare(
      'UPDATE flashcards SET times_reviewed = times_reviewed + 1, times_correct = ? WHERE id = ?'
    ).run(timesCorrect, id);
    return this.findById(id);
  },

  delete(id) {
    db.prepare('DELETE FROM flashcards WHERE id = ?').run(id);
  },

  deleteByMaterialId(materialId) {
    db.prepare('DELETE FROM flashcards WHERE material_id = ?').run(materialId);
  },

  getCount(userId) {
    return db.prepare('SELECT COUNT(*) as count FROM flashcards WHERE user_id = ?').get(userId).count;
  },
};

module.exports = Flashcard;
