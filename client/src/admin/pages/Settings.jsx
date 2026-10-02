import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, ListChecks, Power, ShieldCheck } from 'lucide-react'
import api, { auth, errorMessage } from '../api.js'
import { usePolling } from '../hooks.js'
import { Card, CardHeader, PageHeader, Toggle } from '../components/ui.jsx'
import ChangePasswordCard from '../components/ChangePasswordCard.jsx'

function Settings() {
  const fetcher = useCallback(() => api.get('/settings').then((r) => r.data), [])
  const { data, reload } = usePolling(fetcher, 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const active = data?.quizActive ?? false

  const toggle = async (value) => {
    const confirmText = value
      ? 'Ouvrir le quiz ? Les participants pourront s’inscrire et jouer immédiatement.'
      : 'Fermer le quiz ? Les nouvelles inscriptions seront bloquées (les parties en cours pourront se terminer).'
    if (!window.confirm(confirmText)) return

    setSaving(true)
    setError('')
    try {
      await api.put('/settings', { quizActive: value })
      await reload()
      window.dispatchEvent(new Event('quiz-settings-changed'))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Paramètres" subtitle="Contrôlez l’ouverture du quiz et votre session" />

      <Card delay={60} className="relative overflow-hidden">
        <div className={`absolute inset-y-0 left-0 w-1.5 ${active ? 'bg-morocco-green' : 'bg-slate-300'}`} />
        <div className="flex flex-col gap-5 pl-2 sm:flex-row sm:items-center">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md transition ${
              active ? 'bg-gradient-to-br from-morocco-green to-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Power className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Activation du quiz</h3>
            <p className="mt-1 text-sm text-slate-500">
              {active
                ? 'Le quiz est ouvert : les participants peuvent scanner le QR code, s’inscrire et répondre.'
                : 'Le quiz est fermé : la page participant affiche un message d’attente et se rouvre automatiquement dès l’activation.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${active ? 'text-morocco-green' : 'text-slate-500'}`}>
              {data ? (active ? 'Actif' : 'Désactivé') : '…'}
            </span>
            <Toggle checked={active} onChange={toggle} disabled={!data || saving} label="Activer le quiz" />
          </div>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-morocco-red">{error}</p>}
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card delay={120}>
          <CardHeader title="Questions et réponses" subtitle="Modifier le contenu du quiz" icon={ListChecks} />
          <p className="text-sm text-slate-600">
            Ajoutez, modifiez, réordonnez ou désactivez des questions. Si vous changez une bonne réponse, les scores déjà
            enregistrés sont recalculés automatiquement.
          </p>
          <Link to="/admin/questions" className="mt-4 inline-flex text-sm font-semibold text-navy hover:text-gold">
            Gérer les questions →
          </Link>
        </Card>

        <Card delay={180}>
          <CardHeader title="Session administrateur" subtitle="Sécurité du compte" icon={ShieldCheck} />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Connecté en tant que</dt>
              <dd className="font-semibold text-slate-800">{auth.username}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Durée de session</dt>
              <dd className="font-semibold text-slate-800">12 heures</dd>
            </div>
          </dl>
          <p className="mt-4 flex gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Les scores ne sont jamais affichés aux participants : ils ne sont visibles que dans cet espace.
          </p>
        </Card>
      </div>

      <div className="mt-4">
        <ChangePasswordCard delay={240} />
      </div>
    </>
  )
}

export default Settings
