import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import PartnerLogos from '../components/PartnerLogos.jsx'
import { useContent } from '../content/ContentContext.js'
import { quizUrl } from '../lib/quizUrl.js'
import airshowStar from '../assets/event/airshow-star.png'

const POLL_MS = 5000
const NEW_BADGE_MS = 60000
const TIMER_TICK_MS = 200
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function LiveBadge({ open, updatedAt }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy shadow-sm ring-1 ring-navy/10 backdrop-blur">
      <span className="relative flex h-2.5 w-2.5">
        {open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-morocco-red opacity-75" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${open ? 'bg-morocco-red' : 'bg-navy/30'}`} />
      </span>
      {open ? 'En direct' : 'Quiz fermé'}
      {updatedAt && (
        <span className="hidden font-semibold normal-case tracking-normal text-navy/50 sm:inline">
          · mis à jour à {updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )}
    </div>
  )
}

function useCountdown(seconds) {
  const total = seconds * 1000
  const [timer, setTimer] = useState(() => ({ endsAt: Date.now() + total, left: total }))

  useEffect(() => {
    if (!timer.endsAt) return
    const id = setInterval(() => {
      const left = Math.max(0, timer.endsAt - Date.now())
      setTimer(left === 0 ? { endsAt: null, left: 0 } : { endsAt: timer.endsAt, left })
    }, TIMER_TICK_MS)
    return () => clearInterval(id)
  }, [timer.endsAt])

  return {
    left: timer.left,
    total,
    running: timer.endsAt !== null,
    start: () => setTimer((t) => ({ endsAt: Date.now() + (t.left || total), left: t.left || total })),
    pause: () => setTimer((t) => ({ endsAt: null, left: Math.max(0, t.endsAt - Date.now()) })),
    reset: () => setTimer({ endsAt: null, left: total }),
  }
}

function QuestionTimer({ seconds }) {
  const { left, total, running, start, pause, reset } = useCountdown(seconds)
  const ratio = left / total
  const done = left === 0
  const color = done || ratio <= 0.2 ? 'text-morocco-red' : ratio <= 0.5 ? 'text-gold' : 'text-morocco-green'
  const bar = done || ratio <= 0.2 ? 'bg-morocco-red' : ratio <= 0.5 ? 'bg-gold' : 'bg-morocco-green'
  const label = done ? 'Temps écoulé !' : running ? 'En cours' : left === total ? 'Chronomètre' : 'En pause'

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-navy/[0.04] p-2.5 ring-1 ring-navy/5">
      <div className={`relative h-12 w-12 shrink-0 ${color}`}>
        <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
          <circle cx="24" cy="24" r="20" fill="white" stroke="rgb(11 31 75 / 0.1)" strokeWidth="4" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - ratio * 100}
            className="transition-[stroke-dashoffset] duration-200 ease-linear"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-base font-bold tabular-nums text-navy">
          {Math.ceil(left / 1000)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-xs font-bold uppercase tracking-wider ${done ? 'text-morocco-red' : 'text-navy/60'}`}>{label}</p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-navy/10">
          <div
            className={`h-full rounded-full transition-[width] duration-200 ease-linear ${bar}`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-navy/50">{seconds} secondes pour répondre</p>
      </div>

      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={running ? pause : start}
          aria-label={running ? 'Mettre en pause' : done ? 'Relancer' : 'Démarrer'}
          title={running ? 'Mettre en pause' : done ? 'Relancer' : 'Démarrer'}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white shadow transition hover:bg-navy-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {running ? <Pause className="h-4 w-4 fill-white" /> : <Play className="ml-0.5 h-4 w-4 fill-white" />}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!running && left === total}
          aria-label="Réinitialiser"
          title="Réinitialiser"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy shadow-sm ring-1 ring-navy/10 transition hover:bg-navy/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function QuestionCard({ question, number, isNew, cardRef }) {
  const isTrueFalse = question.type === 'true_false'

  return (
    <article
      ref={cardRef}
      className={`relative rounded-2xl bg-white/90 p-5 shadow-lg ring-1 backdrop-blur transition sm:p-6 ${
        isNew ? 'animate-pop-in ring-2 ring-gold shadow-gold/30' : 'ring-navy/10'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy font-display text-lg font-bold text-white shadow">
            {number}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
            {isTrueFalse ? 'Vrai ou faux' : 'Choix multiple'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isNew && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
              Nouveau
            </span>
          )}
        </div>
      </div>

      <h2 className="mt-4 font-display text-lg font-bold leading-snug text-navy sm:text-xl">{question.question}</h2>

      <ul className={`mt-4 gap-2.5 ${isTrueFalse ? 'grid grid-cols-2' : 'grid sm:grid-cols-2'}`}>
        {question.options.map((option, index) => (
          <li
            key={index}
            className={`flex items-center gap-3 rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy ${
              isTrueFalse ? 'justify-center font-semibold' : ''
            }`}
          >
            {!isTrueFalse && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/5 text-xs font-bold">
                {LETTERS[index]}
              </span>
            )}
            <span>{option}</span>
          </li>
        ))}
      </ul>

      <QuestionTimer seconds={question.timeLimit} />
    </article>
  )
}

function JoinCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-navy/10">
      <QRCodeSVG
        value={quizUrl}
        size={256}
        level="H"
        fgColor="#0b1f4b"
        imageSettings={{ src: airshowStar, height: 48, width: 48, excavate: true }}
        className="h-24 w-24 shrink-0"
      />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Participez</p>
        <p className="font-display text-lg font-bold leading-tight text-navy">Scannez pour jouer</p>
        <p className="mt-1 text-xs text-navy/60">Répondez depuis votre téléphone</p>
      </div>
    </div>
  )
}

function PublicBoard() {
  const content = useContent()
  const [quiz, setQuiz] = useState(null)
  const [error, setError] = useState(false)
  const [firstSeen, setFirstSeen] = useState({})
  const [now, setNow] = useState(0)
  const cardRefs = useRef(new Map())
  const pendingScroll = useRef(null)
  const loadedOnce = useRef(false)

  const load = useCallback(() => {
    return axios
      .get('/api/quiz')
      .then(({ data }) => {
        const fetchedAt = Date.now()
        const initial = !loadedOnce.current
        loadedOnce.current = true
        setQuiz({ ...data, updatedAt: new Date(fetchedAt) })
        setNow(fetchedAt)
        setError(false)
        setFirstSeen((prev) => {
          const next = { ...prev }
          for (const q of data.questions) {
            if (!(q.id in next)) {
              next[q.id] = initial ? 0 : fetchedAt
              if (!initial && pendingScroll.current === null) pendingScroll.current = q.id
            }
          }
          return next
        })
      })
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    const id = pendingScroll.current
    if (id === null) return
    pendingScroll.current = null
    cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [firstSeen])

  const questions = quiz?.questions ?? []
  const open = quiz?.active !== false

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-sky-hero">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-white/60 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 pt-5 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
        <div className="w-full rounded-2xl bg-white/90 px-4 py-3 shadow-md ring-1 ring-navy/10 backdrop-blur sm:w-auto sm:px-6">
          <PartnerLogos size="md" />
        </div>
        <LiveBadge open={open} updatedAt={quiz?.updatedAt} />
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-10">
        <section className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-navy px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white shadow">
                <span className="flex h-1.5 w-6 overflow-hidden rounded-full">
                  <span className="flex-1 bg-morocco-red" />
                  <span className="flex-1 bg-morocco-green" />
                </span>
                {content.eventDay}
              </div>
              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">
                Questions du quiz
              </h1>
            </div>
            {quiz && (
              <p className="rounded-2xl bg-white/80 px-5 py-3 text-right shadow-sm ring-1 ring-navy/10 backdrop-blur">
                <span className="font-display text-3xl font-extrabold text-navy">{questions.length}</span>
                <span className="text-lg font-bold text-navy/40"> / {quiz.total}</span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/60">
                  questions débloquées
                </span>
              </p>
            )}
          </div>

          {error && (
            <p className="mt-6 rounded-xl bg-morocco-red/90 px-4 py-3 text-sm text-white shadow">
              Connexion perdue, nouvelle tentative automatique…
            </p>
          )}

          {!quiz ? (
            <div className="mt-8 grid gap-4 xl:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-white/60" />
              ))}
            </div>
          ) : !open ? (
            <div className="mt-8 rounded-2xl bg-white/90 p-8 text-center shadow-lg ring-1 ring-navy/10">
              <p className="font-display text-2xl font-bold text-navy">{content.quizClosedTitle}</p>
              <p className="mt-2 text-sm text-navy/60">Les questions s’afficheront ici dès l’ouverture du quiz.</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white/90 p-8 text-center shadow-lg ring-1 ring-navy/10">
              <p className="font-display text-2xl font-bold text-navy">En attente de la première question…</p>
              <p className="mt-2 text-sm text-navy/60">Elle apparaîtra ici dès que les organisateurs la débloqueront.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 xl:grid-cols-2">
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  number={i + 1}
                  isNew={firstSeen[q.id] > 0 && now - firstSeen[q.id] < NEW_BADGE_MS}
                  cardRef={(el) => (el ? cardRefs.current.set(q.id, el) : cardRefs.current.delete(q.id))}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <JoinCard />
            <div className="rounded-2xl bg-white/80 p-4 text-sm text-navy/70 shadow-sm ring-1 ring-navy/10">
              <p className="font-semibold text-navy">{content.eventName}</p>
              <p className="mt-1">
                {content.eventDate} · {content.eventLocation}
              </p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="relative z-0 mt-auto">
        <div className="h-1 bg-gradient-to-r from-morocco-red via-gold to-morocco-green" />
        <div className="bg-navy">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-white/70 sm:flex-row lg:px-10">
            <span className="font-semibold uppercase tracking-[0.2em] text-white">{content.eventName}</span>
            <span>Suivi des questions en direct</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicBoard
