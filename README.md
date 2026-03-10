AI Study Assistant

I built this because I was tired of manually making flashcards and re-reading notes before exams. Upload your study materials (PDFs, Word docs, images, plain text) and let AI do the heavy lifting — summaries, flashcards, quizzes, even predicted exam questions.

What it does

Upload notes in PDF, DOCX, TXT, or even photos of handwritten notes (OCR handles that). Generate summaries, flashcards, and quizzes from your materials with one click. Take quizzes and track your scores over time. Get AI-predicted exam questions based on your notes. Search across all your uploaded stuff. Export flashcards to PDF. Dark mode, mobile friendly, the usual.

Built with

Frontend: React, Vite, TailwindCSS, Recharts for the analytics charts
Backend: Node.js + Express, SQLite (better-sqlite3)
AI: Google Gemini API (gemini-2.5-flash)
Auth: JWT + bcrypt
File parsing: pdf-parse, mammoth (for .docx), tesseract.js (OCR)

Project layout

```
backend/
  src/
    config/           env / app config
    controllers/      request handlers
    database/         sqlite setup + schema
    middleware/       auth, error handling, file uploads
    models/           data access (User, StudyMaterial, Flashcard, etc.)
    routes/           API routes
    services/         AI calls, file parsing, PDF export
    server.js         entry point

frontend/
  src/
    components/       Layout, spinner, protected route wrapper
    context/          Auth + theme providers
    pages/            all the pages (dashboard, upload, quizzes, etc.)
    services/api.js   axios client
    App.jsx
```

Database

SQLite with 6 tables — users, study_materials, flashcards, quizzes, quiz_results, and study_sessions. Foreign keys and indexes are set up in `database/init.js`. Nothing fancy, just gets the job done without needing to run a separate DB server.

API routes

```
POST   /api/auth/signup              register
POST   /api/auth/login               login
GET    /api/auth/profile             get current user

POST   /api/materials                upload a file
GET    /api/materials                list your materials
GET    /api/materials/search?q=      search
GET    /api/materials/:id            single material
POST   /api/materials/:id/summarize  generate AI summary
DELETE /api/materials/:id            delete

POST   /api/flashcards/generate                    generate from material
GET    /api/flashcards                              list all
GET    /api/flashcards/material/:id                 by material
GET    /api/flashcards/material/:id/export          export PDF
PATCH  /api/flashcards/:id/review                   log a review
DELETE /api/flashcards/:id                          delete

POST   /api/quizzes/generate         generate quiz
GET    /api/quizzes                   list quizzes
GET    /api/quizzes/results           your results
GET    /api/quizzes/:id               single quiz
POST   /api/quizzes/:id/submit        submit answers
DELETE /api/quizzes/:id               delete
POST   /api/quizzes/predict           predict exam questions

GET    /api/analytics/dashboard              stats
POST   /api/analytics/sessions/start         start study session
PATCH  /api/analytics/sessions/:id/end       end study session
```

All routes except auth require a JWT token in the `Authorization` header.

Getting started

You'll need Node 18+ and a [Google Gemini API key](https://aistudio.google.com/apikey).

```bash
 clone it
git clone <your-repo-url>
cd AI-Study-Assistant

 backend
cd backend
cp .env.example .env
npm install

 frontend
cd ../frontend
npm install
```

Open `backend/.env` and fill in your keys:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=put-something-long-and-random-here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key
DB_PATH=./data/study_assistant.db
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

Then run both:

```bash
 terminal 1
cd backend
npm run dev

 terminal 2
cd frontend
npm run dev
```

Frontend is at `http://localhost:5173`, backend at `http://localhost:5000`. The Vite config proxies `/api` requests to the backend so everything just works.

Deploying

Backend (Render, Railway, whatever): set your env vars, `npm install`, `npm start`. Make sure `data/` and `uploads/` are on persistent storage or your DB and files will disappear on redeploy.

Frontend (Vercel, Netlify): build command is `npm run build`, output dir is `dist`. You'll need to set up a rewrite/proxy to point `/api/*` at your backend URL.

Stuff I might add later

Spaced repetition (SM-2) for smarter flashcard scheduling. Study groups / sharing materials. Voice notes with speech-to-text. Chat-style AI tutor for Q&A. OAuth (Google, GitHub login). Offline/PWA support.
