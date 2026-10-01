import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import EventHeader from '../EventHeader.jsx'

const MAX_AVATAR_SIZE = 3 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const inputClass =
  'w-full rounded-xl border bg-white/90 px-4 py-3 text-navy shadow-sm placeholder:text-navy/40 focus:outline-none focus:ring-2'

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-morocco-red">{error}</p>}
    </div>
  )
}

function ParticipantForm({ onRegistered, onBack }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' })
  const [avatar, setAvatar] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInput = useRef(null)

  const preview = useMemo(() => (avatar ? URL.createObjectURL(avatar) : null), [avatar])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const pickAvatar = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return setErrors((prev) => ({ ...prev, avatar: 'Format non supporté (JPG, PNG ou WEBP).' }))
    }
    if (file.size > MAX_AVATAR_SIZE) {
      return setErrors((prev) => ({ ...prev, avatar: 'La photo ne doit pas dépasser 3 Mo.' }))
    }
    setErrors((prev) => ({ ...prev, avatar: undefined }))
    setAvatar(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value.trim()))
    if (avatar) data.append('avatar', avatar)

    try {
      const { data: registration } = await axios.post('/api/participants', data)
      onRegistered(registration)
    } catch (err) {
      const res = err.response?.data
      setErrors(res?.errors ?? {})
      setMessage(res?.message ?? 'Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  const borderFor = (field) =>
    errors[field] ? 'border-morocco-red focus:ring-morocco-red/30' : 'border-navy/20 focus:border-gold focus:ring-gold/40'

  return (
    <div className="flex flex-1 flex-col animate-fade-up">
      <EventHeader compact />

      <section className="mt-4 rounded-2xl bg-white/90 p-6 shadow-xl ring-1 ring-navy/10 backdrop-blur">
        <h1 className="text-center font-display text-2xl font-bold text-navy">Inscription</h1>
        <p className="mt-1 text-center text-sm text-navy/70">Renseignez vos informations pour commencer</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-gold bg-navy/5 transition hover:bg-navy/10"
              aria-label="Ajouter une photo"
            >
              {preview ? (
                <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full flex-col items-center justify-center text-navy/60">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
                    <path d="M6.8 7.5 8.3 5h7.4l1.5 2.5H20a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1h2.8Z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                  <span className="mt-1 text-[10px] font-semibold uppercase">Photo</span>
                </span>
              )}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={pickAvatar}
              className="hidden"
            />
            <p className="mt-2 text-xs text-navy/60">
              {avatar ? (
                <button type="button" onClick={() => setAvatar(null)} className="text-morocco-red underline">
                  Retirer la photo
                </button>
              ) : (
                'Photo / avatar (facultatif)'
              )}
            </p>
            {errors.avatar && <p className="mt-1 text-xs text-morocco-red">{errors.avatar}</p>}
          </div>

          <Field id="fullName" label="Nom et prénom" error={errors.fullName}>
            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={update('fullName')}
              placeholder="Ex : Yassine El Amrani"
              autoComplete="name"
              required
              className={`${inputClass} ${borderFor('fullName')}`}
            />
          </Field>

          <Field id="email" label="Adresse e-mail" error={errors.email}>
            <input
              id="email"
              type="email"
              inputMode="email"
              value={form.email}
              onChange={update('email')}
              placeholder="exemple@email.com"
              autoComplete="email"
              required
              className={`${inputClass} ${borderFor('email')}`}
            />
          </Field>

          <Field id="phone" label="Téléphone" error={errors.phone}>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={update('phone')}
              placeholder="+212 6 00 00 00 00"
              autoComplete="tel"
              required
              className={`${inputClass} ${borderFor('phone')}`}
            />
          </Field>

          {message && (
            <p className="rounded-lg bg-morocco-red/10 px-3 py-2 text-center text-sm text-morocco-red">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-navy py-3.5 font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Enregistrement…' : 'Commencer le quiz'}
          </button>
        </form>
      </section>

      <button type="button" onClick={onBack} className="mt-4 text-center text-sm font-semibold text-navy/70 underline">
        Retour
      </button>
    </div>
  )
}

export default ParticipantForm
