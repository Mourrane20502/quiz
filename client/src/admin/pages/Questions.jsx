import { useCallback, useState } from 'react'
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, ListChecks, Pencil, Plus, Radio, Timer, Trash2, X } from 'lucide-react'
import api, { errorMessage } from '../api.js'
import { usePolling } from '../hooks.js'
import { Button, Card, EmptyState, PageHeader, Toggle } from '../components/ui.jsx'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const EMPTY = { question: '', type: 'mcq', options: ['', '', '', ''], correctIndex: 0, timeLimit: 20 }

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15'

function QuestionModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    initial ? { ...initial, options: initial.type === 'true_false' ? ['Vrai', 'Faux'] : [...initial.options] } : EMPTY,
  )
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const isTrueFalse = form.type === 'true_false'
  const answerChanged = initial && initial.correctIndex !== form.correctIndex

  const setType = (type) =>
    setForm((f) => ({
      ...f,
      type,
      options: type === 'true_false' ? ['Vrai', 'Faux'] : f.options.length >= 2 && f.type === 'mcq' ? f.options : ['', '', '', ''],
      correctIndex: 0,
    }))

  const setOption = (index, value) =>
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === index ? value : o)) }))

  const removeOption = (index) =>
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, i) => i !== index),
      correctIndex: f.correctIndex === index ? 0 : f.correctIndex > index ? f.correctIndex - 1 : f.correctIndex,
    }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setMessage('')
    const payload = { ...form, timeLimit: Number(form.timeLimit), options: form.options.map((o) => o.trim()) }
    try {
      if (initial) await api.put(`/questions/${initial.id}`, payload)
      else await api.post('/questions', payload)
      onSaved()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
      setMessage(errorMessage(err, 'Enregistrement impossible.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-fade-up"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{initial ? 'Modifier la question' : 'Nouvelle question'}</h2>
            <p className="text-sm text-slate-500">Cochez la bonne réponse parmi les propositions.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Question</label>
            <textarea
              rows={3}
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              className={fieldClass}
              placeholder="Saisissez l’intitulé de la question"
            />
            {errors.question && <p className="mt-1 text-xs text-morocco-red">{errors.question}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Type</label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {[
                  ['mcq', 'QCM'],
                  ['true_false', 'Vrai / Faux'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={`rounded-lg py-2 text-sm font-semibold transition ${
                      form.type === value ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Temps (secondes)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={form.timeLimit}
                onChange={(e) => setForm((f) => ({ ...f, timeLimit: e.target.value }))}
                className={fieldClass}
              />
              {errors.timeLimit && <p className="mt-1 text-xs text-morocco-red">{errors.timeLimit}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Réponses</label>
            <ul className="space-y-2">
              {form.options.map((option, index) => {
                const correct = form.correctIndex === index
                return (
                  <li
                    key={index}
                    className={`flex items-center gap-2 rounded-xl border p-1.5 pl-2 transition ${
                      correct ? 'border-morocco-green bg-emerald-50/60' : 'border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, correctIndex: index }))}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                        correct ? 'bg-morocco-green text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title="Définir comme bonne réponse"
                    >
                      {correct ? <CheckCircle2 className="h-4 w-4" /> : LETTERS[index]}
                    </button>
                    <input
                      value={option}
                      onChange={(e) => setOption(index, e.target.value)}
                      disabled={isTrueFalse}
                      placeholder={`Réponse ${LETTERS[index]}`}
                      className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:text-slate-700"
                    />
                    {!isTrueFalse && form.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-morocco-red"
                        aria-label="Supprimer la réponse"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            {!isTrueFalse && form.options.length < 6 && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, options: [...f.options, ''] }))}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold"
              >
                <Plus className="h-4 w-4" /> Ajouter une réponse
              </button>
            )}
            {(errors.options || errors.correctIndex) && (
              <p className="mt-1 text-xs text-morocco-red">{errors.options || errors.correctIndex}</p>
            )}
          </div>

          {initial?.answersCount > 0 && (
            <div
              className={`flex gap-3 rounded-xl px-4 py-3 text-sm ${
                answerChanged ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' : 'bg-slate-50 text-slate-600'
              }`}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {initial.answersCount} réponse(s) déjà enregistrée(s) pour cette question.
                {answerChanged && ' Changer la bonne réponse recalculera automatiquement les scores des participants.'}
              </p>
            </div>
          )}

          {message && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-morocco-red">{message}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : initial ? 'Enregistrer' : 'Créer la question'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Questions() {
  const fetcher = useCallback(() => api.get('/questions').then((r) => r.data), [])
  const { data, loading, reload } = usePolling(fetcher, 0)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  const run = async (id, action) => {
    setBusy(id)
    setError('')
    try {
      await action()
      await reload()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const remove = (q) => {
    const warning = q.answersCount
      ? `Supprimer cette question effacera aussi ${q.answersCount} réponse(s) et recalculera les scores. Continuer ?`
      : 'Supprimer définitivement cette question ?'
    if (window.confirm(warning)) run(q.id, () => api.delete(`/questions/${q.id}`))
  }

  const activeCount = data?.filter((q) => q.isActive).length ?? 0

  return (
    <>
      <PageHeader
        title="Gestion des questions"
        subtitle={`${data?.length ?? 0} question(s) · ${activeCount} active(s) dans le quiz`}
      >
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" /> Nouvelle question
        </Button>
      </PageHeader>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-morocco-red">{error}</p>}

      {data?.length > 0 && activeCount < data.length && (
        <div className="mb-4 flex gap-3 rounded-xl border border-sky/30 bg-sky/5 px-4 py-3 text-sm text-slate-700">
          <Radio className="mt-0.5 h-4 w-4 shrink-0 text-sky" />
          <p>
            <span className="font-semibold text-navy">Mode direct :</span> {data.length - activeCount} question(s)
            inactive(s). Les participants qui ont répondu aux {activeCount} question(s) active(s) restent en attente :
            chaque question que vous activez leur est envoyée automatiquement. Le quiz se termine pour eux une fois les{' '}
            {data.length} questions répondues (supprimez une question pour la retirer du total).
          </p>
        </div>
      )}

      {loading && !data ? (
        <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
      ) : !data?.length ? (
        <Card>
          <EmptyState icon={ListChecks} title="Aucune question" text="Créez votre première question pour démarrer le quiz." />
        </Card>
      ) : (
        <ul className="space-y-3">
          {data.map((q, i) => (
            <li key={q.id}>
              <Card delay={Math.min(i, 12) * 30} className={`transition ${q.isActive ? '' : 'bg-slate-50 opacity-70'} ${busy === q.id ? 'opacity-50' : ''}`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="flex items-start gap-3 md:flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white">{i + 1}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={i === 0 || busy}
                          onClick={() => run(q.id, () => api.patch(`/questions/${q.id}/move`, { direction: 'up' }))}
                          className="rounded p-0.5 text-slate-400 hover:text-navy disabled:opacity-30"
                          aria-label="Monter"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={i === data.length - 1 || busy}
                          onClick={() => run(q.id, () => api.patch(`/questions/${q.id}/move`, { direction: 'down' }))}
                          className="rounded p-0.5 text-slate-400 hover:text-navy disabled:opacity-30"
                          aria-label="Descendre"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-navy">
                          {q.type === 'true_false' ? 'Vrai / Faux' : 'QCM'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Timer className="h-3.5 w-3.5" /> {q.timeLimit} s
                        </span>
                        <span className="text-xs text-slate-400">· {q.answersCount} réponse(s)</span>
                      </div>
                      <p className="mt-2 font-semibold leading-snug text-slate-900">{q.question}</p>
                      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                        {q.options.map((o, idx) => (
                          <li
                            key={idx}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                              idx === q.correctIndex ? 'bg-emerald-50 font-semibold text-morocco-green' : 'text-slate-600'
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                idx === q.correctIndex ? 'bg-morocco-green text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {LETTERS[idx]}
                            </span>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-100 pt-3 md:flex-col md:items-end md:border-0 md:pt-0">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      {q.isActive ? 'Active' : 'Inactive'}
                      <Toggle
                        checked={q.isActive}
                        disabled={!!busy}
                        label="Activer la question"
                        onChange={() => run(q.id, () => api.patch(`/questions/${q.id}/toggle`))}
                      />
                    </label>
                    <div className="ml-auto flex gap-1 md:ml-0 md:mt-2">
                      <Button variant="ghost" className="px-2.5" onClick={() => setEditing(q)} aria-label="Modifier">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" className="px-2.5 hover:text-morocco-red" onClick={() => remove(q)} aria-label="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <QuestionModal
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}
    </>
  )
}

export default Questions
