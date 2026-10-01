import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, LogIn, User } from 'lucide-react'
import api, { auth, errorMessage } from './api.js'
import airshowLogo from '../assets/event/airshow-logo.png'
import jets from '../assets/event/jets-cutout.png'

function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (auth.token) return <Navigate to="/admin/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/login', form)
      auth.save(data.token, data.admin.username)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Connexion impossible.'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15'

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-navy lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-sky/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-[26rem] w-[26rem] rounded-full bg-gold/20 blur-3xl" />

        <div className="relative inline-flex w-fit rounded-2xl bg-white/95 px-5 py-3 shadow-lg">
          <img src={airshowLogo} alt="Marrakech Airshow 2026" className="h-12 w-auto" />
        </div>

        <div className="relative">
          <img
            src={jets}
            alt=""
            className="mb-10 w-[26rem] max-w-full animate-glide [mask-image:linear-gradient(to_right,transparent_8%,black_45%)]"
          />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-light">Espace organisateurs</p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-white">
            Pilotez le quiz
            <br />
            en temps réel.
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Suivez les participants, le classement et les statistiques de la Journée Talents depuis un seul tableau
            de bord.
          </p>
        </div>

        <div className="relative flex h-1 w-40 overflow-hidden rounded-full">
          <span className="flex-1 bg-morocco-red" />
          <span className="flex-1 bg-gold" />
          <span className="flex-1 bg-morocco-green" />
        </div>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-up">
          <img src={airshowLogo} alt="Marrakech Airshow 2026" className="mx-auto mb-8 h-14 w-auto lg:hidden" />

          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white shadow-lg">
            <Lock className="h-5 w-5" />
          </span>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Connexion administrateur</h2>
          <p className="mt-1 text-sm text-slate-500">Accès réservé à l’équipe d’organisation.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Adresse e-mail
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className={inputClass}
                  placeholder="admin@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={`${inputClass} pr-11`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-morocco-red ring-1 ring-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 font-semibold text-white shadow-lg transition hover:bg-navy-dark disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default AdminLogin
