import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  PanelsTopLeft,
  Settings,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import api, { auth } from './api.js'
import { Avatar } from './components/ui.jsx'
import airshowStar from '../assets/event/airshow-star.png'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/participants', label: 'Liste des participants', icon: Users },
  { to: '/admin/classement', label: 'Classement', icon: Trophy },
  { to: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  { to: '/admin/questions', label: 'Gestion des questions', icon: ListChecks },
  { to: '/admin/b2c', label: 'Gestion B2C', icon: PanelsTopLeft },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
]

function Sidebar({ onNavigate, quizActive }) {
  const navigate = useNavigate()

  const logout = () => {
    auth.clear()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex h-full flex-col bg-navy text-white">
      <div className="flex items-center gap-3 px-6 py-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 shadow">
          <img src={airshowStar} alt="" className="h-full w-full object-contain" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-lg font-bold">Airshow Quiz</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-light">Administration</p>
        </div>
      </div>

      <div className="mx-4 mb-4 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
        <span className="text-xs font-medium text-white/70">Statut du quiz</span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
            quizActive ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-white/60'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${quizActive ? 'animate-pulse bg-emerald-300' : 'bg-white/50'}`} />
          {quizActive === null ? '…' : quizActive ? 'Actif' : 'Fermé'}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-navy shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-gold' : ''}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-2">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4.5 w-4.5" />
          Voir la page publique
        </a>
      </div>

      <div className="m-3 flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
        <Avatar name={auth.username ?? 'Admin'} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{auth.username}</p>
          <p className="text-[11px] text-white/50">Administrateur</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <div className="flex h-1">
        <span className="flex-1 bg-morocco-red" />
        <span className="flex-1 bg-gold" />
        <span className="flex-1 bg-morocco-green" />
      </div>
    </div>
  )
}

function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [quizActive, setQuizActive] = useState(null)
  const location = useLocation()

  useEffect(() => {
    if (!auth.token) return
    const load = () =>
      api
        .get('/settings')
        .then(({ data }) => setQuizActive(data.quizActive))
        .catch(() => {})
    load()
    const id = setInterval(load, 10000)
    window.addEventListener('quiz-settings-changed', load)
    return () => {
      clearInterval(id)
      window.removeEventListener('quiz-settings-changed', load)
    }
  }, [])

  if (!auth.token) return <Navigate to="/admin" replace state={{ from: location.pathname }} />

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <Sidebar quizActive={quizActive} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-up">
            <Sidebar quizActive={quizActive} onNavigate={() => setOpen(false)} />
          </aside>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white p-2 text-navy shadow"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-navy hover:bg-slate-100"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-display text-lg font-bold text-navy">Airshow Quiz</p>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
