import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Quiz from './pages/Quiz.jsx'
import PublicContent from './content/PublicContent.jsx'

const AdminLogin = lazy(() => import('./admin/AdminLogin.jsx'))
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'))
const Dashboard = lazy(() => import('./admin/pages/Dashboard.jsx'))
const Participants = lazy(() => import('./admin/pages/Participants.jsx'))
const Leaderboard = lazy(() => import('./admin/pages/Leaderboard.jsx'))
const QuestionStats = lazy(() => import('./admin/pages/QuestionStats.jsx'))
const Questions = lazy(() => import('./admin/pages/Questions.jsx'))
const Settings = lazy(() => import('./admin/pages/Settings.jsx'))
const ContentManager = lazy(() => import('./admin/pages/ContentManager.jsx'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-navy/15 border-t-navy" />
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicContent />}>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
        </Route>

        <Route path="/admin">
          <Route index element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="participants" element={<Participants />} />
            <Route path="classement" element={<Leaderboard />} />
            <Route path="statistiques" element={<QuestionStats />} />
            <Route path="questions" element={<Questions />} />
            <Route path="b2c" element={<ContentManager />} />
            <Route path="parametres" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
