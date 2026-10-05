import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Eye,
  House,
  Image as ImageIcon,
  ListOrdered,
  PartyPopper,
  RotateCcw,
  Smartphone,
  Upload,
} from 'lucide-react'
import api, { errorMessage } from '../api.js'
import { Button, Card, CardHeader, PageHeader } from '../components/ui.jsx'
import { LOGOS } from '../../data/logos.js'

const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const LOGO_MAX_BYTES = 2 * 1024 * 1024

const SECTIONS = [
  {
    title: 'Événement',
    subtitle: 'Informations reprises sur toutes les pages publiques',
    icon: CalendarDays,
    columns: 2,
    fields: [
      { key: 'eventName', label: 'Nom de l’événement', where: 'Pied de page de l’accueil, écran de remerciement' },
      { key: 'eventDay', label: 'Nom de la journée', where: 'Badge de l’accueil, page quiz, remerciement' },
      { key: 'eventDate', label: 'Date', where: 'Page quiz, carte « Date »' },
      { key: 'eventCity', label: 'Ville', where: 'Page quiz, carte « Lieu »' },
      { key: 'eventLocation', label: 'Lieu complet', where: 'Pied de page de l’accueil' },
      { key: 'organizer', label: 'Organisateur', where: 'Bas de la page quiz : « Organisé par … »' },
      { key: 'partner', label: 'Partenaire', where: 'Bas de la page quiz : « … avec le … »' },
    ],
  },
  {
    title: 'Page d’accueil',
    subtitle: 'Titre et présentation à côté du QR code',
    icon: House,
    fields: [
      { key: 'homeTitle', label: 'Titre (ligne 1)', where: 'Grand titre, en bleu marine' },
      { key: 'homeTitleHighlight', label: 'Titre (ligne 2)', where: 'Grand titre, en dégradé de couleurs' },
      { key: 'homeDescription', label: 'Description', where: 'Paragraphe sous le titre', multiline: true },
    ],
  },
  {
    title: 'Étapes de l’accueil',
    subtitle: 'Les trois cartes « Scannez / Inscrivez-vous / Décollez »',
    icon: ListOrdered,
    columns: 3,
    fields: [1, 2, 3].flatMap((n) => [
      { key: `step${n}Title`, label: `Étape ${n} · titre` },
      { key: `step${n}Text`, label: `Étape ${n} · texte`, multiline: true },
    ]),
  },
  {
    title: 'Page de suivi (/suivi)',
    subtitle: 'Titre et présentation à côté du QR code vers /public',
    icon: Eye,
    fields: [
      { key: 'followTitle', label: 'Titre (ligne 1)', where: 'Grand titre, en bleu marine' },
      { key: 'followTitleHighlight', label: 'Titre (ligne 2)', where: 'Grand titre, en dégradé de couleurs' },
      { key: 'followDescription', label: 'Description', where: 'Paragraphe sous le titre', multiline: true },
    ],
  },
  {
    title: 'Page quiz',
    subtitle: 'Écran d’introduction affiché après le scan du QR code',
    icon: Smartphone,
    fields: [
      { key: 'quizTitle', label: 'Titre', where: 'Grand titre au-dessus du nom de la journée' },
      { key: 'quizDescription', label: 'Description', where: 'Paragraphe de présentation', multiline: true },
      { key: 'quizClosedTitle', label: 'Message « quiz fermé » · titre', where: 'Affiché quand le quiz est désactivé' },
      { key: 'quizClosedText', label: 'Message « quiz fermé » · texte', multiline: true },
    ],
  },
  {
    title: 'Écran de remerciement',
    subtitle: 'Affiché quand le participant a répondu à toutes les questions',
    icon: PartyPopper,
    fields: [{ key: 'thankYouText', label: 'Message', where: 'Sous « Merci {prénom} ! »', multiline: true }],
  },
]

const COLUMNS = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 xl:grid-cols-3' }

function Field({ field, value, savedValue, defaultValue, max, error, onChange }) {
  const length = value.length
  const tooLong = max && length > max
  const customized = savedValue !== defaultValue
  const inputClass = `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-4 ${
    error || tooLong ? 'border-morocco-red focus:ring-morocco-red/15' : 'border-slate-200 focus:border-gold focus:ring-gold/15'
  }`

  return (
    <div className={field.multiline && !field.key.startsWith('step') ? 'md:col-span-full' : ''}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={field.key} className="text-sm font-semibold text-slate-800">
          {field.label}
        </label>
        {customized && (
          <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
            Personnalisé
          </span>
        )}
      </div>
      {field.multiline ? (
        <textarea
          id={field.key}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      ) : (
        <input id={field.key} type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
      <div className="mt-1 flex items-start justify-between gap-3 text-xs">
        <p className={error ? 'text-morocco-red' : 'text-slate-400'}>{error ?? field.where}</p>
        <div className="flex shrink-0 items-center gap-3">
          {value !== defaultValue && (
            <button
              type="button"
              onClick={() => onChange(defaultValue)}
              className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-navy"
              title={defaultValue}
            >
              <RotateCcw className="h-3 w-3" /> Valeur par défaut
            </button>
          )}
          {max && <span className={tooLong ? 'font-semibold text-morocco-red' : 'text-slate-400'}>{length}/{max}</span>}
        </div>
      </div>
    </div>
  )
}

function LogoTile({ logo, customUrl, onChange, titleField }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async (request) => {
    setBusy(true)
    setError('')
    try {
      const { data: payload } = await request()
      onChange(payload.content.logos)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const pick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!LOGO_TYPES.includes(file.type)) return setError('Format non supporté (PNG, JPG ou WEBP).')
    if (file.size > LOGO_MAX_BYTES) return setError('Le logo ne doit pas dépasser 2 Mo.')
    const body = new FormData()
    body.append('logo', file)
    run(() => api.post(`/content/logos/${logo.slot}`, body))
  }

  const restore = () => {
    if (window.confirm(`Restaurer l’image d’origine du logo « ${titleField.savedValue} » ?`)) {
      run(() => api.delete(`/content/logos/${logo.slot}`))
    }
  }

  return (
    <div className={`flex flex-col rounded-2xl ring-1 ring-slate-200 transition ${busy ? 'opacity-60' : ''}`}>
      <div className="relative flex h-36 items-center justify-center rounded-t-2xl bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] p-5">
        <img
          src={customUrl || logo.src}
          alt={titleField.value}
          title={titleField.value}
          className="max-h-full max-w-full object-contain"
        />
        <span
          className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            customUrl ? 'bg-gold/10 text-gold' : 'bg-white/90 text-slate-500 ring-1 ring-slate-200'
          }`}
        >
          {customUrl ? 'Image personnalisée' : 'Image originale'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 border-t border-slate-100 p-4">
        <Field {...titleField} />
        {error && <p className="text-xs text-morocco-red">{error}</p>}
        <div className="mt-auto flex flex-wrap gap-2">
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-navy px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-navy-dark ${
              busy ? 'pointer-events-none' : ''
            }`}
          >
            <Upload className="h-3.5 w-3.5" /> {busy ? 'Envoi…' : 'Remplacer'}
            <input type="file" accept={LOGO_TYPES.join(',')} onChange={pick} className="hidden" disabled={busy} />
          </label>
          {customUrl && (
            <Button variant="ghost" className="px-3 py-2 text-xs" onClick={restore} disabled={busy}>
              <RotateCcw className="h-3.5 w-3.5" /> Restaurer l’original
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function LogosCard({ logos, onChange, fieldProps }) {
  return (
    <Card>
      <CardHeader
        title="Logos des partenaires"
        subtitle="Affichés dans cet ordre en haut de l’accueil et de la page quiz"
        icon={ImageIcon}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {LOGOS.map((logo) => (
          <LogoTile
            key={logo.slot}
            logo={logo}
            customUrl={logos?.[logo.slot]}
            onChange={onChange}
            titleField={fieldProps({
              key: logo.titleKey,
              label: 'Titre du logo',
              where: 'Texte alternatif et infobulle au survol',
            })}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Image : PNG à fond transparent recommandé, au moins 200 px de haut · PNG, JPG ou WEBP · 2 Mo maximum, publiée
        dès l’envoi. Titre : publié avec le bouton « Publier ».
      </p>
    </Card>
  )
}

function ContentManager() {
  const [data, setData] = useState(null)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  const load = (payload) => {
    setData(payload)
    setForm(payload.content)
  }

  useEffect(() => {
    api
      .get('/content')
      .then(({ data: payload }) => load(payload))
      .catch((err) => setError(errorMessage(err)))
  }, [])

  const changedKeys = useMemo(
    () =>
      form && data ? Object.keys(data.limits).filter((key) => form[key] !== data.content[key]) : [],
    [form, data],
  )
  const dirty = changedKeys.length > 0

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  useEffect(() => {
    if (!savedAt) return
    const id = setTimeout(() => setSavedAt(null), 4000)
    return () => clearTimeout(id)
  }, [savedAt])

  const updateLogos = (logos) => {
    setData((prev) => ({ ...prev, content: { ...prev.content, logos } }))
    setSavedAt(Date.now())
  }

  const update = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const fieldProps = (field) => ({
    field,
    value: form[field.key] ?? '',
    savedValue: data.content[field.key],
    defaultValue: data.defaults[field.key],
    max: data.limits[field.key],
    error: errors[field.key],
    onChange: update(field.key),
  })

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const content = Object.fromEntries(changedKeys.map((key) => [key, form[key]]))
      const { data: payload } = await api.put('/content', { content })
      load(payload)
      setErrors({})
      setSavedAt(Date.now())
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Gestion B2C" subtitle="Textes affichés aux participants sur la page d’accueil et la page quiz">
        {[
          { href: '/', label: 'Accueil' },
          { href: '/quiz', label: 'Page quiz' },
          { href: '/suivi', label: 'Page de suivi' },
        ].map(({ href, label }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" /> {label}
          </a>
        ))}
      </PageHeader>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-morocco-red">{error}</p>}
      {savedAt && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 animate-fade-up">
          <CheckCircle2 className="h-4 w-4" /> Modifications publiées : elles sont visibles immédiatement par les
          nouveaux visiteurs.
        </p>
      )}

      {!form ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
          ))}
        </div>
      ) : (
        <div className={`space-y-4 ${dirty ? 'pb-24' : ''}`}>
          <LogosCard logos={data.content.logos} onChange={updateLogos} fieldProps={fieldProps} />
          {SECTIONS.map((section, i) => (
            <Card key={section.title} delay={i * 60}>
              <CardHeader title={section.title} subtitle={section.subtitle} icon={section.icon} />
              <div className={`grid gap-4 ${COLUMNS[section.columns ?? 1]}`}>
                {section.fields.map((field) => (
                  <Field key={field.key} {...fieldProps(field)} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {dirty && (
        <div className="fixed inset-x-4 bottom-4 z-30 animate-fade-up lg:left-[19rem] lg:right-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl bg-navy px-5 py-3.5 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <span className="font-bold">{changedKeys.length}</span> modification(s) non publiée(s)
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white" onClick={() => setForm(data.content)} disabled={saving}>
                Annuler
              </Button>
              <Button className="bg-gold text-navy hover:bg-gold-light" onClick={save} disabled={saving}>
                {saving ? 'Publication…' : 'Publier'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ContentManager
