import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import airshowLogo from '../assets/event/airshow-logo.png'
import airshowStar from '../assets/event/airshow-star.png'
import jets from '../assets/event/jets-cutout.png'
import { event } from '../data/event.js'

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const baseUrl = import.meta.env.VITE_APP_URL || (isLocalhost ? __LAN_URL__ : window.location.origin)
const quizUrl = `${baseUrl.replace(/\/$/, '')}/quiz`

const STEPS = [
  {
    title: 'Scannez',
    text: 'Pointez l’appareil photo de votre téléphone vers le QR code.',
    icon: (
      <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M8 8h3v3H8zM13 13h3v3h-3zM13 8h3M8 16h3" />
    ),
  },
  {
    title: 'Inscrivez-vous',
    text: 'Nom, e-mail, téléphone et, si vous le souhaitez, une photo.',
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5" />
      </>
    ),
  },
  {
    title: 'Décollez',
    text: 'Répondez vite et juste : chaque question est chronométrée.',
    icon: <path d="M21 4 3 11l7 2.5L12.5 21 21 4ZM10 13.5 21 4" />,
  },
]

function Contrails() {
  return (
    <svg
      className="pointer-events-none absolute -left-24 top-24 h-[34rem] w-[60rem] opacity-80"
      viewBox="0 0 960 540"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="trail-white" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="trail-red" x1="0" x2="1">
          <stop offset="0" stopColor="#c1272d" stopOpacity="0" />
          <stop offset="1" stopColor="#c1272d" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="trail-blue" x1="0" x2="1">
          <stop offset="0" stopColor="#1f4fa8" stopOpacity="0" />
          <stop offset="1" stopColor="#1f4fa8" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <path d="M0 520C220 380 420 250 900 90" stroke="url(#trail-white)" strokeWidth="22" strokeLinecap="round" />
      <path d="M0 470C230 340 440 220 910 60" stroke="url(#trail-red)" strokeWidth="14" strokeLinecap="round" />
      <path d="M0 430C240 300 460 190 920 30" stroke="url(#trail-blue)" strokeWidth="12" strokeLinecap="round" />
      <path d="M0 540C210 420 400 300 880 130" stroke="url(#trail-white)" strokeWidth="10" strokeLinecap="round" />
    </svg>
  )
}

function StepIcon({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      {children}
    </svg>
  )
}

function Stat({ value, label }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-3xl font-extrabold text-navy xl:text-4xl">{value}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-navy/60">{label}</span>
    </div>
  )
}

function QrCard() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(quizUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-gold-light/50 via-white/40 to-sky/30 blur-2xl" />

      <div className="relative rounded-[2rem] bg-white/95 p-8 shadow-[0_30px_80px_-20px_rgba(11,31,75,0.45)] ring-1 ring-navy/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Accès participant</p>
            <p className="mt-1 font-display text-2xl font-bold text-navy">Scannez pour jouer</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white">
            <StepIcon>{STEPS[0].icon}</StepIcon>
          </span>
        </div>

        <div className="relative mx-auto mt-6 aspect-square w-full max-w-[19rem] p-4">
          {['left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl'].map((pos) => (
            <span key={pos} className={`absolute h-10 w-10 border-gold ${pos}`} />
          ))}

          <QRCodeSVG
            value={quizUrl}
            size={512}
            level="H"
            fgColor="#0b1f4b"
            bgColor="#ffffff"
            imageSettings={{ src: airshowStar, height: 96, width: 96, excavate: true }}
            className="h-full w-full"
          />

          <span className="pointer-events-none absolute inset-x-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-morocco-red to-transparent shadow-[0_0_12px_2px_rgba(193,39,45,0.5)] animate-scan" />
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-navy/5 p-1.5 pl-4">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy/70">{quizUrl.replace(/^https?:\/\//, '')}</span>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-navy shadow-sm ring-1 ring-navy/10 transition hover:bg-navy hover:text-white"
          >
            {copied ? 'Copié ✓' : 'Copier'}
          </button>
        </div>

        <Link
          to="/quiz"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-navy-dark"
        >
          Jouer sur cet appareil
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function Home() {
  const [quizInfo, setQuizInfo] = useState(null)

  useEffect(() => {
    const load = () =>
      axios
        .get('/api/quiz')
        .then(({ data }) => {
          const limits = data.questions.map((q) => q.timeLimit)
          setQuizInfo({
            active: data.active,
            total: data.total || null,
            minTime: limits.length ? Math.min(...limits) : null,
          })
        })
        .catch(() => setQuizInfo(null))

    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  const open = quizInfo?.active !== false

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-sky-hero">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-white/60 blur-3xl" />
      <Contrails />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-6 lg:px-10">
        <img src={airshowLogo} alt={event.name} className="h-14 w-auto drop-shadow-sm sm:h-16" />
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy shadow-sm ring-1 ring-navy/10 backdrop-blur">
          <span className="relative flex h-2.5 w-2.5">
            {open && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-morocco-red opacity-75" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${open ? 'bg-morocco-red' : 'bg-navy/30'}`} />
          </span>
          {open ? 'Quiz en direct' : 'Ouverture prochaine'}
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-10">
        <section className="animate-fade-up">
          <div className="inline-flex items-center gap-3 rounded-full bg-navy px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white shadow">
            <span className="flex h-1.5 w-6 overflow-hidden rounded-full">
              <span className="flex-1 bg-morocco-red" />
              <span className="flex-1 bg-morocco-green" />
            </span>
            {event.day}
          </div>

          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] text-navy sm:text-6xl xl:text-7xl">
            Prenez votre envol,
            <span className="block bg-gradient-to-r from-morocco-red via-gold to-morocco-green bg-clip-text text-transparent">
              testez vos connaissances.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy/75">
            Le quiz officiel de la {event.day} du {event.name}. Aéronautique, industrie et culture du salon :
            relevez le défi depuis votre téléphone.
          </p>

          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="group relative rounded-2xl bg-white/75 p-5 shadow-sm ring-1 ring-navy/10 backdrop-blur transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white shadow-md">
                    <StepIcon>{step.icon}</StepIcon>
                  </span>
                  <span className="font-display text-3xl font-extrabold text-navy/10 transition group-hover:text-gold/40">
                    0{i + 1}
                  </span>
                </div>
                <p className="mt-4 font-bold text-navy">{step.title}</p>
                <p className="mt-1 text-sm leading-snug text-navy/65">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-navy/10 pt-6">
            <Stat value={quizInfo?.total ?? '—'} label="Questions" />
            <Stat value={quizInfo?.minTime ? `${quizInfo.minTime}s` : '—'} label="Par question" />
            <Stat value="1" label="Seule tentative" />
          </div>
        </section>

        <section className="relative animate-fade-up [animation-delay:150ms]">
          <img
            src={jets}
            alt=""
            className="pointer-events-none absolute -top-24 left-1/2 hidden w-[28rem] max-w-none -translate-x-1/2 animate-glide lg:block"
          />
          <QrCard />
        </section>
      </main>

      <footer className="relative z-0 mt-auto">
        <div className="relative bg-navy">
          <div className="h-1 bg-gradient-to-r from-morocco-red via-gold to-morocco-green" />
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-white/70 sm:flex-row lg:px-10">
            <span className="font-semibold uppercase tracking-[0.2em] text-white">{event.name}</span>
            <span>{event.day} · {event.location}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
