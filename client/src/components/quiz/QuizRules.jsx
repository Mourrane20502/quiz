import { createPortal } from 'react-dom'
import { Ban, LogOut, RefreshCwOff, ShieldAlert, Timer } from 'lucide-react'
import EventHeader from '../EventHeader.jsx'

const RULES = [
  {
    icon: RefreshCwOff,
    title: 'N’actualisez pas la page',
    text: 'Si la page est actualisée, la question en cours sera comptée comme « temps écoulé ».',
  },
  {
    icon: LogOut,
    title: 'Ne quittez pas le quiz',
    text: 'Ne fermez pas l’onglet et n’utilisez pas le bouton retour de votre téléphone.',
  },
  {
    icon: Timer,
    title: 'Chaque question est chronométrée',
    text: 'Le compte à rebours démarre dès l’affichage de la question.',
  },
  {
    icon: Ban,
    title: 'Réponses définitives',
    text: 'Une fois choisie, une réponse ne peut plus être modifiée.',
  },
]

function QuizRules({ participant, onAccept, loading }) {
  const firstName = participant?.fullName?.split(' ')[0]

  return (
    <div className="flex flex-1 flex-col">
      <EventHeader compact />

      {createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-navy-dark/60 p-4 backdrop-blur-sm animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-title"
            className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-pop-in"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-morocco-red/10 text-morocco-red">
                <ShieldAlert className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gold">Important</p>
                <h2 id="rules-title" className="font-display text-xl font-bold text-navy">
                  Avant de commencer{firstName ? `, ${firstName}` : ''}
                </h2>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {RULES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-xl bg-navy/[0.03] p-3 ring-1 ring-navy/5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
                  <div>
                    <p className="text-sm font-bold text-navy">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-navy/65">{text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onAccept}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-navy py-3.5 font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-navy-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? 'Chargement…' : 'J’ai compris, commencer'}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

export default QuizRules
