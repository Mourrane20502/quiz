import EventHeader from '../EventHeader.jsx'
import { useContent } from '../../content/ContentContext.js'

function QuizResult({ participant }) {
  const content = useContent()

  return (
    <div className="flex flex-1 flex-col animate-fade-up">
      <EventHeader compact />

      <section className="mt-4 rounded-2xl bg-white/90 p-6 text-center shadow-xl ring-1 ring-navy/10 backdrop-blur">
        {participant.avatar ? (
          <img
            src={participant.avatar}
            alt={participant.fullName}
            className="mx-auto mb-3 h-20 w-20 rounded-full border-2 border-gold object-cover shadow"
          />
        ) : (
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-navy text-white shadow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-9 w-9">
              <path d="M5 12.5 10 17l9-10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">{content.eventDay}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-navy">Merci {participant.fullName} !</h1>
        <p className="mt-3 text-sm leading-relaxed text-navy/75">{content.thankYouText}</p>

        <div className="mx-auto mt-5 flex h-1 w-24 overflow-hidden rounded-full">
          <span className="flex-1 bg-morocco-red" />
          <span className="flex-1 bg-navy" />
          <span className="flex-1 bg-morocco-green" />
        </div>

        <p className="mt-4 text-xs text-navy/60">{content.eventName}</p>
      </section>
    </div>
  )
}

export default QuizResult
