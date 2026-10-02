import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plane } from 'lucide-react'
import EventHeader from '../EventHeader.jsx'
import jets from '../../assets/event/jets-cutout.png'
import { event } from '../../data/event.js'

function ReadyDialog({ questionCount, onConfirm, onCancel }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onCancel])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/60 p-5 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ready-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl animate-pop-in"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 ring-1 ring-navy/10">
          <Plane className="h-7 w-7 -rotate-45 text-navy" />
        </div>
        <h2 id="ready-title" className="mt-4 font-display text-xl font-bold text-navy">
          Êtes-vous prêt pour le quiz ?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-navy/70">
          {questionCount} questions chronométrées vous attendent. Vous n’aurez droit qu’à une seule
          tentative.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-navy/15 py-3 font-semibold text-navy transition hover:bg-navy/5"
          >
            Non
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-navy py-3 font-semibold text-white shadow-lg transition hover:bg-navy-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Oui
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-white/80 px-3 py-2 text-center shadow-sm ring-1 ring-navy/10 backdrop-blur">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-navy">{value}</p>
    </div>
  )
}

function EventIntro({ onStart, loaded, active, questionCount }) {
  const closed = loaded && !active
  const [confirming, setConfirming] = useState(false)
  const cancelConfirm = useCallback(() => setConfirming(false), [])

  return (
    <div className="flex flex-1 flex-col animate-fade-up">
      <EventHeader />

      <img
        src={jets}
        alt=""
        className="mx-auto mt-8 w-64 animate-fly [mask-image:linear-gradient(to_right,transparent_5%,black_40%)]"
      />

      <section className="mt-6 text-center">
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-navy">Quiz</h1>
        <div className="mx-auto mt-2 flex items-center justify-center gap-2">
          <span className="h-px w-12 bg-navy/60" />
          <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-navy">
            {event.day}
          </p>
          <span className="h-px w-12 bg-navy/60" />
        </div>
        <div className="mx-auto mt-3 flex h-1 w-24 overflow-hidden rounded-full">
          <span className="flex-1 bg-morocco-red" />
          <span className="flex-1 bg-navy" />
          <span className="flex-1 bg-morocco-green" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-navy/80">{event.description}</p>
      </section>

      <section className="mt-5 grid grid-cols-3 gap-2">
        <InfoItem label="Date" value={event.date} />
        <InfoItem label="Lieu" value="Marrakech" />
        <InfoItem label="Questions" value={questionCount ?? '—'} />
      </section>

      {closed ? (
        <div className="mt-6 rounded-xl border border-gold/40 bg-white/85 px-4 py-4 text-center shadow-sm">
          <p className="font-semibold text-navy">Le quiz n’est pas encore ouvert</p>
          <p className="mt-1 text-xs text-navy/60">
            Restez sur cette page : elle se mettra à jour automatiquement dès l’ouverture.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={!questionCount}
          className="mt-6 w-full rounded-xl bg-navy py-3.5 font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Participer au quiz
        </button>
      )}

      <p className="mt-4 text-center text-[11px] text-navy/60">
        Organisé par {event.organizer} avec le {event.partner}
      </p>

      {confirming && !closed && (
        <ReadyDialog
          questionCount={questionCount}
          onConfirm={onStart}
          onCancel={cancelConfirm}
        />
      )}
    </div>
  )
}

export default EventIntro
