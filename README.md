# AI Study Assistant

A full-stack AI-powered study platform that helps students learn more effectively by generating summaries, flashcards, quizzes, and exam predictions from uploaded study materials.

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | React 18, TailwindCSS, Vite, Recharts  |
| Backend        | Node.js, Express.js                     |
| Database       | SQLite (via better-sqlite3)             |
| AI             | OpenAI API (GPT-4o-mini)               |
| Authentication | JWT + bcrypt                            |
| File Processing| pdf-parse, mammoth, tesseract.js        |

## Features

- **User Authentication** — Signup, login, logout with JWT tokens and bcrypt password hashing
- **File Upload** — Support for PDF, DOCX, TXT, and images (PNG, JPG, WebP)
- **OCR** — Automatic text extraction from images using Tesseract.js
- **AI Summaries** — One-click summarization of study materials
- **AI Flashcards** — Auto-generated flashcards with difficulty levels
- **AI Quizzes** — Multiple choice quizzes with scoring and explanations
- **Exam Predictions** — AI-predicted exam questions based on your notes
- **Performance Tracking** — Quiz scores, study time, and progress analytics
- **Search** — Full-text search across all uploaded notes
- **Export** — Download flashcards as PDF
- **Dark Mode** — System-aware dark/light theme toggle
- **Mobile Responsive** — Full mobile-first responsive design
- **Rate Limiting** — API rate limiting for security
- **Input Validation** — Server-side validation with express-validator

## Project Structure

```
AI-Study-Assistant/
├── backend/
│   ├── src/
│   │   ├── config/           # App configuration
│   │   ├── controllers/      # Route handlers
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── flashcardController.js
│   │   │   ├── materialController.js
│   │   │   └── quizController.js
│   │   ├── database/         # SQLite connection & schema
│   │   │   ├── connection.js
│   │   │   └── init.js
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── models/           # Data access layer
│   │   │   ├── Flashcard.js
│   │   │   ├── Quiz.js
│   │   │   ├── QuizResult.js
│   │   │   ├── StudyMaterial.js
│   │   │   ├── StudySession.js
│   │   │   └── User.js
│   │   ├── routes/           # API route definitions
│   │   │   ├── analytics.js
│   │   │   ├── auth.js
│   │   │   ├── flashcards.js
│   │   │   ├── materials.js
│   │   │   └── quizzes.js
│   │   ├── services/         # Business logic
│   │   │   ├── aiService.js
│   │   │   ├── fileProcessor.js
│   │   │   └── pdfGenerator.js
│   │   └── server.js         # Express app entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Shared UI components
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/          # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FlashcardsPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MaterialPage.jsx
│   │   │   ├── QuizzesPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── StudyFlashcardsPage.jsx
│   │   │   ├── TakeQuizPage.jsx
│   │   │   └── UploadPage.jsx
│   │   ├── services/         # API client
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Database Schema

### Users
| Column        | Type     | Description              |
| ------------- | -------- | ------------------------ |
| id            | TEXT PK  | UUID                     |
| email         | TEXT     | Unique email             |
| username      | TEXT     | Unique username          |
| password_hash | TEXT     | bcrypt hashed password   |
| created_at    | DATETIME | Account creation time    |
| updated_at    | DATETIME | Last update              |

### StudyMaterials
| Column            | Type     | Description               |
| ----------------- | -------- | ------------------------- |
| id                | TEXT PK  | UUID                      |
| user_id           | TEXT FK  | Owner reference           |
| title             | TEXT     | Material title            |
| original_filename | TEXT     | Uploaded filename         |
| file_type         | TEXT     | MIME type                 |
| file_path         | TEXT     | Server file path          |
| parsed_content    | TEXT     | Extracted text content    |
| summary           | TEXT     | AI-generated summary      |
| file_size         | INTEGER  | File size in bytes        |

### Flashcards
| Column         | Type     | Description            |
| -------------- | -------- | ---------------------- |
| id             | TEXT PK  | UUID                   |
| user_id        | TEXT FK  | Owner                  |
| material_id    | TEXT FK  | Source material         |
| front          | TEXT     | Question               |
| back           | TEXT     | Answer                 |
| difficulty     | TEXT     | easy/medium/hard       |
| times_reviewed | INTEGER  | Review count           |
| times_correct  | INTEGER  | Correct answer count   |

### Quizzes
| Column      | Type     | Description            |
| ----------- | -------- | ---------------------- |
| id          | TEXT PK  | UUID                   |
| user_id     | TEXT FK  | Owner                  |
| material_id | TEXT FK  | Source material         |
| title       | TEXT     | Quiz title             |
| questions   | TEXT     | JSON array of questions|
| quiz_type   | TEXT     | multiple_choice        |

### QuizResults
| Column          | Type     | Description            |
| --------------- | -------- | ---------------------- |
| id              | TEXT PK  | UUID                   |
| user_id         | TEXT FK  | Test taker             |
| quiz_id         | TEXT FK  | Quiz reference         |
| score           | REAL     | Percentage score       |
| total_questions | INTEGER  | Total question count   |
| correct_answers | INTEGER  | Correct count          |
| answers         | TEXT     | JSON detailed answers  |

### StudySessions
| Column           | Type     | Description            |
| ---------------- | -------- | ---------------------- |
| id               | TEXT PK  | UUID                   |
| user_id          | TEXT FK  | Student                |
| material_id      | TEXT FK  | Optional material      |
| session_type     | TEXT     | study/flashcard/quiz   |
| duration_minutes | INTEGER  | Duration               |
| started_at       | DATETIME | Start time             |
| ended_at         | DATETIME | End time               |

## API Endpoints

### Authentication
| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| POST   | /api/auth/signup   | Register user    |
| POST   | /api/auth/login    | Login user       |
| GET    | /api/auth/profile  | Get user profile |

### Study Materials
| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| POST   | /api/materials                | Upload material          |
| GET    | /api/materials                | List user materials      |
| GET    | /api/materials/search?q=      | Search materials         |
| GET    | /api/materials/:id            | Get single material      |
| POST   | /api/materials/:id/summarize  | Generate AI summary      |
| DELETE | /api/materials/:id            | Delete material          |

### Flashcards
| Method | Endpoint                                   | Description           |
| ------ | ------------------------------------------ | --------------------- |
| POST   | /api/flashcards/generate                   | Generate flashcards   |
| GET    | /api/flashcards                            | List all flashcards   |
| GET    | /api/flashcards/material/:materialId       | Get by material       |
| GET    | /api/flashcards/material/:materialId/export| Export as PDF         |
| PATCH  | /api/flashcards/:id/review                 | Record review         |
| DELETE | /api/flashcards/:id                        | Delete flashcard      |

### Quizzes
| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| POST   | /api/quizzes/generate     | Generate quiz         |
| GET    | /api/quizzes              | List quizzes          |
| GET    | /api/quizzes/results      | Get quiz results      |
| GET    | /api/quizzes/:id          | Get single quiz       |
| POST   | /api/quizzes/:id/submit   | Submit quiz answers   |
| DELETE | /api/quizzes/:id          | Delete quiz           |
| POST   | /api/quizzes/predict      | Predict exam questions|

### Analytics
| Method | Endpoint                      | Description         |
| ------ | ----------------------------- | ------------------- |
| GET    | /api/analytics/dashboard      | Dashboard stats     |
| POST   | /api/analytics/sessions/start | Start study session |
| PATCH  | /api/analytics/sessions/:id/end | End study session |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- An OpenAI API key

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY and a strong JWT_SECRET
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=generate_a_strong_random_string_here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-openai-api-key
DB_PATH=./data/study_assistant.db
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

> **Security**: Never commit `.env` files. Use a strong random string for `JWT_SECRET` (32+ characters).

### 3. Initialize Database

```bash
cd backend
npm run db:init
```

### 4. Run Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API requests to the backend on port 5000.

## Deployment

### Backend Deployment (Render / Railway / VPS)

1. Push backend code to a Git repository
2. Set environment variables on the hosting platform:
   - `PORT`, `NODE_ENV=production`, `JWT_SECRET`, `OPENAI_API_KEY`
3. Build command: `npm install`
4. Start command: `npm start`
5. Ensure the `data/` and `uploads/` directories are on persistent storage

### Frontend Deployment (Vercel / Netlify)

1. Push frontend code to Git
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variable for API URL or update `vite.config.js` proxy

For Vercel, add a `vercel.json`:
```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "https://your-backend-url.com/api/$1" }]
}
```

### API Key Security

- Store `OPENAI_API_KEY` in environment variables only — never in code
- Use `.env` locally, platform secrets in production
- Rotate keys regularly
- The backend uses rate limiting to prevent API abuse

## Future Improvements

- **Spaced Repetition Algorithm** — SM-2 algorithm for optimized flashcard scheduling
- **Collaborative Study** — Share materials and study groups
- **Voice Notes** — Audio upload with speech-to-text
- **AI Chat Tutor** — Conversational AI for Q&A on materials
- **Progress Goals** — Set daily/weekly study targets with reminders
- **Multiple AI Models** — Support for Claude, Gemini, open-source LLMs
- **Offline Mode** — PWA support with service workers
- **Export Options** — Export quizzes, summaries as PDF/Markdown
- **Admin Dashboard** — User management and usage analytics
- **Email Notifications** — Study reminders and progress reports
- **OAuth** — Login with Google / GitHub
- **WebSocket Updates** — Real-time AI generation progress
