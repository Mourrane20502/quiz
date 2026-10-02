import EventHeader from '../EventHeader.jsx'

function QuizWaiting({ participant, progress }) {
  const { answered, total } = progress
  const percent = total ? Math.min((answered / total) * 100, 100) : 0
  const firstName = participant?.fullName?.split(' ')[0]

  return (
    <div className="flex flex-1 flex-col animate-fade-up">
      <EventHeader compact />

      <section className="mt-4 rounded-2xl bg-white/90 p-6 text-center shadow-xl ring-1 ring-navy/10 backdrop-blur">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-sky/20 [animation-duration:2s]" />
          <span className="absolute inset-2 rounded-full border-2 border-dashed border-gold/60 animate-[spin_12s_linear_infinite]" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-navy text-white shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 -rotate-45 animate-fly">
              <path d="M21 4 3 11l7 2.5L12.5 21 21 4ZM10 13.5 21 4" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gold">En attente</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-navy">
          Bravo{firstName ? ` ${firstName}` : ''}, restez connecté !
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-navy/75">
          Vous avez répondu à toutes les questions disponibles. Les prochaines questions seront débloquées par les
          organisateurs et apparaîtront automatiquement ici.
        </p>

        <div className="mt-6 text-left">
          <div className="flex items-center justify-between text-xs font-semibold text-navy">
            <span>
              {answered} / {total} questions répondues
            </span>
            <span>{Math.round(percent)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-morocco-red via-gold to-morocco-green transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-navy">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-morocco-green opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-morocco-green" />
          </span>
          En attente de la prochaine question…
        </div>

        <p className="mt-5 rounded-lg bg-navy/5 px-3 py-2 text-xs leading-relaxed text-navy/60">
          Gardez cette page ouverte. Si vous la quittez, réinscrivez-vous avec le même numéro de téléphone pour
          reprendre là où vous en étiez.
        </p>
      </section>
    </div>
  )
}

export default QuizWaiting
