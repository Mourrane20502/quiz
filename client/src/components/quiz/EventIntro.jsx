import EventHeader from '../EventHeader.jsx'
import airshowLogo from '../../assets/event/airshow-logo.png'
import jets from '../../assets/event/jets.png'
import { event } from '../../data/event.js'

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
  return (
    <div className="flex flex-1 flex-col animate-fade-up">
      <EventHeader />

      <div className="mt-6 flex justify-center">
        <img src={airshowLogo} alt={event.name} className="w-64 max-w-full" />
      </div>

      <img src={jets} alt="" className="mx-auto mt-4 w-56 animate-fly" />

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
          onClick={onStart}
          disabled={!questionCount}
          className="mt-6 w-full rounded-xl bg-navy py-3.5 font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Participer au quiz
        </button>
      )}

      <p className="mt-4 text-center text-[11px] text-navy/60">
        Organisé par {event.organizer} avec le {event.partner}
      </p>
    </div>
  )
}

export default EventIntro
