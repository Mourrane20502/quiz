import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import PartnerLogos from '../PartnerLogos.jsx'
import airshowStar from '../../assets/event/airshow-star.png'
import jets from '../../assets/event/jets-cutout.png'
import { useContent } from '../../content/ContentContext.js'
import { STEP_ICONS } from './stepIcons.jsx'

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

function QrCard({ url, eyebrow, title, linkTo, linkLabel }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
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
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
            <p className="mt-1 font-display text-2xl font-bold text-navy">{title}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white">
            <StepIcon>{STEP_ICONS.scan}</StepIcon>
          </span>
        </div>

        <div className="relative mx-auto mt-6 aspect-square w-full max-w-[19rem] p-4">
          {['left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl'].map((pos) => (
            <span key={pos} className={`absolute h-10 w-10 border-gold ${pos}`} />
          ))}

          <QRCodeSVG
            value={url}
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
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy/70">{url.replace(/^https?:\/\//, '')}</span>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-navy shadow-sm ring-1 ring-navy/10 transition hover:bg-navy hover:text-white"
          >
            {copied ? 'Copié ✓' : 'Copier'}
          </button>
        </div>

        <Link
          to={linkTo}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-navy-dark"
        >
          {linkLabel}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function LandingPage({ open, statusLabels, title, highlight, description, steps = [], stats, qr }) {
  const content = useContent()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-sky-hero">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-white/60 blur-3xl" />
      <Contrails />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 pt-5 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
        <div className="w-full rounded-2xl bg-white/90 px-4 py-3 shadow-md ring-1 ring-navy/10 backdrop-blur sm:w-auto sm:px-6">
          <PartnerLogos size="lg" />
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy shadow-sm ring-1 ring-navy/10 backdrop-blur">
          <span className="relative flex h-2.5 w-2.5">
            {open && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-morocco-red opacity-75" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${open ? 'bg-morocco-red' : 'bg-navy/30'}`} />
          </span>
          {open ? statusLabels.open : statusLabels.closed}
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-5 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:px-10">
        <section className="min-w-0 animate-fade-up">
          <div className="inline-flex items-center gap-3 rounded-full bg-navy px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white shadow">
            <span className="flex h-1.5 w-6 overflow-hidden rounded-full">
              <span className="flex-1 bg-morocco-red" />
              <span className="flex-1 bg-morocco-green" />
            </span>
            {content.eventDay}
          </div>

          <h1 className="mt-6 break-words font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-navy sm:text-6xl xl:text-7xl">
            {title}
            <span className="block bg-gradient-to-r from-morocco-red via-gold to-morocco-green bg-clip-text text-transparent">
              {highlight}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy/75">{description}</p>

          {steps.length > 0 && (
            <ol className="mt-10 grid gap-4 sm:grid-cols-3">
              {steps.map((step, i) => (
                <li
                  key={i}
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
          )}

          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-navy/10 pt-6">
            {stats.map((stat) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </section>

        <section className="relative min-w-0 animate-fade-up [animation-delay:150ms]">
          <img
            src={jets}
            alt=""
            className="pointer-events-none absolute -top-24 left-1/2 hidden w-[28rem] max-w-none -translate-x-1/2 animate-glide lg:block"
          />
          <QrCard {...qr} />
        </section>
      </main>

      <footer className="relative z-0 mt-auto">
        <div className="relative bg-navy">
          <div className="h-1 bg-gradient-to-r from-morocco-red via-gold to-morocco-green" />
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-white/70 sm:flex-row lg:px-10">
            <span className="font-semibold uppercase tracking-[0.2em] text-white">{content.eventName}</span>
            <span>
              {content.eventDay} · {content.eventLocation}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
