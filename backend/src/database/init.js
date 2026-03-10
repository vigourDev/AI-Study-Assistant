const db = require('./connection');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_materials (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      parsed_content TEXT,
      summary TEXT,
      file_size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      times_reviewed INTEGER DEFAULT 0,
      times_correct INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      title TEXT NOT NULL,
      questions TEXT NOT NULL,
      quiz_type TEXT DEFAULT 'multiple_choice',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      score REAL NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      answers TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      material_id TEXT,
      session_type TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 0,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_materials_user ON study_materials(user_id);
    CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
    CREATE INDEX IF NOT EXISTS idx_flashcards_material ON flashcards(material_id);
    CREATE INDEX IF NOT EXISTS idx_quizzes_user ON quizzes(user_id);
    CREATE INDEX IF NOT EXISTS idx_quizzes_material ON quizzes(material_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz ON quiz_results(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
  `);

  console.log('Database initialized successfully');
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
  process.exit(0);
}

module.exports = initializeDatabase;
