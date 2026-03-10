import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import MaterialPage from './pages/MaterialPage';
import FlashcardsPage from './pages/FlashcardsPage';
import StudyFlashcardsPage from './pages/StudyFlashcardsPage';
import QuizzesPage from './pages/QuizzesPage';
import TakeQuizPage from './pages/TakeQuizPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Layout><UploadPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/materials/:id"
              element={
                <ProtectedRoute>
                  <Layout><MaterialPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/flashcards"
              element={
                <ProtectedRoute>
                  <Layout><FlashcardsPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/flashcards/study/:materialId"
              element={
                <ProtectedRoute>
                  <Layout><StudyFlashcardsPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <Layout><QuizzesPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/:id"
              element={
                <ProtectedRoute>
                  <Layout><TakeQuizPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout><AnalyticsPage /></Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
