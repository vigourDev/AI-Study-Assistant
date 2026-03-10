import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  Upload,
  Sparkles,
  BookOpen,
  Brain,
  BarChart3,
  Target,
  FileText,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const features = [
  { icon: Upload, title: 'Upload Materials', desc: 'PDF, DOCX, text files, and images with OCR support' },
  { icon: Sparkles, title: 'AI Summaries', desc: 'Get concise summaries of your study materials instantly' },
  { icon: BookOpen, title: 'Smart Flashcards', desc: 'Auto-generated flashcards with spaced repetition tracking' },
  { icon: Brain, title: 'Interactive Quizzes', desc: 'Multiple choice quizzes generated from your notes' },
  { icon: Target, title: 'Exam Predictions', desc: 'AI predicts likely exam questions from your materials' },
  { icon: BarChart3, title: 'Study Analytics', desc: 'Track your performance and study habits over time' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-primary-600">StudyAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {user ? (
            <Link to="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Log In</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          Powered by AI
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Study Smarter,{' '}
          <span className="text-primary-600">Not Harder</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Upload your study materials and let AI generate summaries, flashcards, quizzes, and exam predictions — all in seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup" className="btn-primary text-lg py-3 px-8 inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/login" className="btn-secondary text-lg py-3 px-8">
            Log In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-white dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need to Ace Your Exams</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Our AI-powered platform transforms your study materials into interactive learning experiences
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-shadow">
                <div className="p-2 w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="space-y-8">
          {[
            { step: '1', title: 'Upload Your Materials', desc: 'Upload PDFs, documents, text files, or even images of your notes' },
            { step: '2', title: 'AI Processes Your Content', desc: 'Our AI extracts text, understands the content, and generates study aids' },
            { step: '3', title: 'Study & Track Progress', desc: 'Use flashcards, take quizzes, and track your improvement over time' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                {step}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-primary-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Study Routine?</h2>
        <p className="mb-8 text-primary-100 max-w-xl mx-auto">
          Join thousands of students who are studying smarter with AI-powered tools
        </p>
        <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-primary-700 font-medium py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors">
          Start Studying Now <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap className="h-5 w-5 text-primary-600" />
          <span className="font-semibold text-primary-600">StudyAI</span>
        </div>
        <p>&copy; {new Date().getFullYear()} AI Study Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
}
