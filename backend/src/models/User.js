const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const User = {
  create({ email, username, passwordHash }) {
    const id = uuidv4();
    const stmt = db.prepare(
      'INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, email, username, passwordHash);
    return this.findById(id);
  },

  findById(id) {
    return db.prepare('SELECT id, email, username, created_at, updated_at FROM users WHERE id = ?').get(id);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },
};

module.exports = User;
