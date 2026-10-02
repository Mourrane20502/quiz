import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react'
import api, { errorMessage } from '../api.js'
import { Button, Card, CardHeader } from './ui.jsx'

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

function strength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return { label: 'Faible', width: '33%', color: 'bg-morocco-red', text: 'text-morocco-red' }
  if (score <= 3) return { label: 'Moyen', width: '66%', color: 'bg-gold', text: 'text-gold' }
  return { label: 'Fort', width: '100%', color: 'bg-morocco-green', text: 'text-morocco-green' }
}

function PasswordField({ id, label, value, onChange, error, autoComplete, visible, onToggle }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-11 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-4 ${
            error ? 'border-morocco-red focus:ring-red-100' : 'border-slate-200 focus:border-gold focus:ring-gold/15'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label={visible ? 'Masquer' : 'Afficher'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-morocco-red">{error}</p>}
    </div>
  )
}

function ChangePasswordCard({ delay = 0 }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [visible, setVisible] = useState(false)

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setMessage(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    const localErrors = {}
    if (form.newPassword.length < 8) localErrors.newPassword = 'Au moins 8 caractères.'
    if (form.confirmPassword !== form.newPassword) localErrors.confirmPassword = 'Les mots de passe ne correspondent pas.'
    if (!form.currentPassword) localErrors.currentPassword = 'Le mot de passe actuel est requis.'
    if (Object.keys(localErrors).length) return setErrors(localErrors)

    setSaving(true)
    setMessage(null)
    try {
      const { data } = await api.put('/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setForm(EMPTY)
      setErrors({})
      setMessage({ type: 'success', text: data.message })
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
      setMessage({ type: 'error', text: errorMessage(err, 'Modification impossible.') })
    } finally {
      setSaving(false)
    }
  }

  const s = form.newPassword ? strength(form.newPassword) : null
  const fieldProps = { visible, onToggle: () => setVisible((v) => !v) }

  return (
    <Card delay={delay}>
      <CardHeader title="Modifier le mot de passe" subtitle="Choisissez un mot de passe d’au moins 8 caractères" icon={KeyRound} />

      <form onSubmit={submit} noValidate className="space-y-4">
        <PasswordField
          id="currentPassword"
          label="Mot de passe actuel"
          value={form.currentPassword}
          onChange={update('currentPassword')}
          error={errors.currentPassword}
          autoComplete="current-password"
          {...fieldProps}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <PasswordField
              id="newPassword"
              label="Nouveau mot de passe"
              value={form.newPassword}
              onChange={update('newPassword')}
              error={errors.newPassword}
              autoComplete="new-password"
              {...fieldProps}
            />
            {s && (
              <div className="mt-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-all duration-300 ${s.color}`} style={{ width: s.width }} />
                </div>
                <p className={`mt-1 text-[11px] font-semibold ${s.text}`}>Sécurité : {s.label}</p>
              </div>
            )}
          </div>
          <PasswordField
            id="confirmPassword"
            label="Confirmer le nouveau mot de passe"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
            {...fieldProps}
          />
        </div>

        {message && (
          <p
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-morocco-red'
            }`}
          >
            {message.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <KeyRound className="h-4 w-4" />
            {saving ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ChangePasswordCard
