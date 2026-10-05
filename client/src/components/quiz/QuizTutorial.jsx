import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Ban,
  Bot,
  Check,
  Lock,
  MessageCircle,
  Pause,
  Play,
  Pointer,
  RotateCcw,
  RotateCw,
  Search,
  SkipBack,
  SkipForward,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import EventHeader from '../EventHeader.jsx'
import airshowStar from '../../assets/event/airshow-star.png'

const TICK = 0.1
const MAX_SPEECH_WAIT = 6
const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

const at = (seconds) => ({ animationDelay: `${seconds}s` })

function Phone({ children }) {
  return (
    <div className="relative h-[262px] w-[156px] shrink-0 rounded-[26px] bg-navy-dark p-[7px] shadow-2xl ring-1 ring-white/20 sm:h-[290px] sm:w-[172px]">
      <div className="absolute left-1/2 top-[11px] z-20 h-[5px] w-12 -translate-x-1/2 rounded-full bg-white/15" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[20px] bg-[#f4f8fd] px-2.5 pb-2.5 pt-6 text-navy">
        {children}
      </div>
    </div>
  )
}

function Finger({ delay, className = '' }) {
  return (
    <span className={`tut-tap pointer-events-none absolute z-10 ${className}`} style={at(delay)}>
      <Pointer className="h-7 w-7 fill-white text-navy drop-shadow-md" />
    </span>
  )
}

function MiniQuestion({ question = 'Quelle est la capitale du Maroc ?', label = 'Question 3 / 10', timer = 20 }) {
  return (
    <>
      <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wide text-navy/50">
        <span>{label}</span>
        <span className="flex items-center gap-0.5">
          <Timer className="h-2.5 w-2.5" /> 20 s
        </span>
      </div>
      <div className="mt-1 h-1 shrink-0 overflow-hidden rounded-full bg-navy/10">
        <div
          className="tut-shrink h-full rounded-full bg-gradient-to-r from-morocco-green via-gold to-morocco-red"
          style={{ animationDuration: `${timer}s` }}
        />
      </div>
      <p className="mt-2.5 font-display text-[11px] font-bold leading-snug">{question}</p>
    </>
  )
}

const OPTIONS = ['Casablanca', 'Rabat', 'Fès', 'Tanger']

function Option({ letter, text, className = '', style, children }) {
  return (
    <div
      className={`relative flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-[10px] font-semibold shadow-sm ring-1 ring-navy/10 ${className}`}
      style={style}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-navy/10 text-[8px] font-bold">
        {letter}
      </span>
      {text}
      {children}
    </div>
  )
}

function Pill({ tone = 'green', delay, children, className = '' }) {
  const tones = {
    green: 'bg-morocco-green text-white',
    red: 'bg-morocco-red text-white',
    gold: 'bg-gold text-white',
    navy: 'bg-navy text-white',
  }
  return (
    <span
      className={`tut-pop inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold shadow-lg ${tones[tone]} ${className}`}
      style={at(delay)}
    >
      {children}
    </span>
  )
}

function Strike({ delay, className = '' }) {
  return (
    <span
      className={`tut-pop absolute flex items-center justify-center rounded-full bg-morocco-red text-white shadow-lg ring-2 ring-white ${className}`}
      style={at(delay)}
    >
      <X className="h-3/5 w-3/5" strokeWidth={3} />
    </span>
  )
}

function IntroVisual() {
  return (
    <div className="flex flex-col items-center text-center">
      <img src={airshowStar} alt="" className="tut-pop h-20 w-auto drop-shadow-lg sm:h-24" />
      <p className="tut-in mt-3 font-display text-2xl font-bold text-navy sm:text-3xl" style={at(0.4)}>
        Prêt à décoller ?
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {['Inscription', 'Questions', 'Règles', 'Résultat'].map((label, i) => (
          <span
            key={label}
            className="tut-pop flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-navy shadow ring-1 ring-navy/10"
            style={at(1 + i * 0.4)}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[10px] text-white">
              {i + 1}
            </span>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

const FORM_FIELDS = [
  ['Nom et prénom', 'Yassine El Amrani'],
  ['École', 'ENSA Marrakech'],
  ['Téléphone', '06 12 34 56 78'],
]

function RegisterVisual() {
  return (
    <Phone>
      <p className="text-center font-display text-[12px] font-bold">Inscription</p>
      <div className="mt-2 space-y-2">
        {FORM_FIELDS.map(([label, value], i) => (
          <div key={label}>
            <p className="text-[8px] font-semibold text-navy/70">{label}</p>
            <div className="mt-0.5 rounded-md bg-white px-2 py-1.5 text-[10px] ring-1 ring-navy/15">
              <span className="tut-type inline-block whitespace-nowrap" style={at(0.6 + i * 1.1)}>
                {value}
              </span>
              &nbsp;
            </div>
          </div>
        ))}
      </div>
      <div className="relative mt-auto">
        <div className="rounded-lg bg-navy py-2 text-center text-[9px] font-bold uppercase tracking-wide text-white">
          Commencer le quiz
        </div>
        <Finger delay={3.9} className="-bottom-3 right-6" />
      </div>
      <div className="absolute inset-x-0 top-7 flex justify-center">
        <Pill delay={5.4}>
          <Check className="h-3 w-3" strokeWidth={3} /> Inscrit !
        </Pill>
      </div>
    </Phone>
  )
}

function AnswerVisual() {
  return (
    <Phone>
      <MiniQuestion />
      <div className="mt-2.5 space-y-1.5">
        {OPTIONS.map((text, i) => (
          <Option
            key={text}
            letter={String.fromCharCode(65 + i)}
            text={text}
            className={i === 1 ? 'tut-select' : ''}
            style={i === 1 ? at(3) : undefined}
          >
            {i === 1 && <Finger delay={1.7} className="-bottom-4 right-3" />}
          </Option>
        ))}
      </div>
      <div className="mt-auto flex justify-center">
        <Pill delay={3.6}>
          <Check className="h-3 w-3" strokeWidth={3} /> Réponse enregistrée
        </Pill>
      </div>
    </Phone>
  )
}

const COUNTDOWN = 5

function TimerVisual({ time }) {
  const remaining = Math.max(0, Math.ceil(COUNTDOWN - time))
  const over = time >= COUNTDOWN

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="white" stroke="rgb(11 31 75 / 0.1)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            pathLength="100"
            strokeDasharray="100"
            strokeLinecap="round"
            strokeWidth="10"
            className={`tut-ring transition-colors ${over ? 'stroke-morocco-red' : 'stroke-gold'}`}
            style={{ animationDuration: `${COUNTDOWN}s` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Timer className={`h-6 w-6 ${over ? 'text-morocco-red' : 'text-navy/50'}`} />
          <span
            className={`font-display text-4xl font-bold tabular-nums ${over ? 'text-morocco-red' : 'text-navy'}`}
          >
            {remaining}
          </span>
        </div>
      </div>
      <div className="mt-4 flex h-14 flex-col items-center gap-1.5">
        {over && (
          <>
            <Pill tone="red" delay={0} className="text-xs">
              <Timer className="h-3.5 w-3.5" /> Temps écoulé !
            </Pill>
            <p className="tut-in text-xs font-semibold text-navy/70" style={at(0.3)}>
              = réponse comptée comme fausse
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function FinalVisual() {
  return (
    <Phone>
      <MiniQuestion />
      <div className="mt-2.5 space-y-1.5">
        {OPTIONS.map((text, i) => (
          <Option
            key={text}
            letter={String.fromCharCode(65 + i)}
            text={text}
            className={i === 1 ? 'bg-navy! text-white!' : i === 2 ? 'tut-shake' : ''}
            style={i === 2 ? at(2.8) : undefined}
          >
            {i === 1 && (
              <span className="tut-pop ml-auto" style={at(0.5)}>
                <Lock className="h-3 w-3 text-gold-light" />
              </span>
            )}
            {i === 2 && <Finger delay={1.5} className="-bottom-4 right-3" />}
          </Option>
        ))}
      </div>
      <div className="mt-auto flex justify-center">
        <Pill tone="red" delay={3.2}>
          <Ban className="h-3 w-3" /> Modification impossible
        </Pill>
      </div>
    </Phone>
  )
}

const BLOCKED_KEYS = ['F5', 'Ctrl + R', '← Retour']

function RefreshVisual() {
  return (
    <div className="flex w-full max-w-[300px] flex-col items-center">
      <div className="tut-in w-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-navy/10">
        <div className="flex items-center gap-2 bg-navy/[0.06] px-3 py-2">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-morocco-red/70" />
            <span className="h-2 w-2 rounded-full bg-gold/70" />
            <span className="h-2 w-2 rounded-full bg-morocco-green/70" />
          </span>
          <span className="relative flex h-6 w-6 items-center justify-center">
            <RotateCw className="tut-pulse h-4 w-4 text-navy" />
            <Strike delay={1.4} className="-inset-1" />
          </span>
          <span className="flex-1 truncate rounded-full bg-white px-2.5 py-1 text-[9px] text-navy/50 ring-1 ring-navy/10">
            quiz · Marrakech Airshow
          </span>
        </div>
        <div className="space-y-1.5 p-3">
          <div className="h-1.5 w-1/3 rounded-full bg-navy/15" />
          <div className="h-2.5 w-4/5 rounded-full bg-navy/25" />
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="h-5 rounded-md bg-navy/[0.06] ring-1 ring-navy/10" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {BLOCKED_KEYS.map((key, i) => (
          <span key={key} className="tut-pop relative" style={at(2.2 + i * 0.4)}>
            <kbd className="block rounded-lg border-b-4 border-navy/20 bg-white px-3 py-1.5 font-sans text-xs font-bold text-navy shadow ring-1 ring-navy/10">
              {key}
            </kbd>
            <Strike delay={2.5 + i * 0.4} className="-right-2 -top-2 h-5 w-5" />
          </span>
        ))}
      </div>

      <div className="mt-4">
        <Pill tone="red" delay={4.2} className="text-xs">
          Question en cours = temps écoulé
        </Pill>
      </div>
    </div>
  )
}

const OTHER_APPS = [
  { icon: Bot, label: 'IA', position: 'left-0 top-4' },
  { icon: Search, label: 'Recherche', position: 'right-0 top-10' },
  { icon: MessageCircle, label: 'Messages', position: 'bottom-6 left-1' },
]

function FocusVisual() {
  return (
    <div className="relative flex w-full max-w-[320px] justify-center">
      <Phone>
        <div className="tut-minimize absolute inset-0 flex flex-col px-2.5 pb-2.5 pt-6" style={at(1.8)}>
          <MiniQuestion />
          <div className="mt-2.5 space-y-1.5">
            {OPTIONS.map((text, i) => (
              <Option key={text} letter={String.fromCharCode(65 + i)} text={text} />
            ))}
          </div>
        </div>
        <div
          className="tut-pop absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-xl bg-morocco-red/10 p-3 text-center ring-1 ring-morocco-red/30"
          style={at(2.7)}
        >
          <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-morocco-red text-white">
            <SkipForward className="h-4 w-4" />
          </span>
          <p className="mt-1.5 font-display text-[11px] font-bold text-morocco-red">Question passée</p>
          <p className="mt-0.5 text-[9px] font-semibold leading-snug text-navy/70">Comptée comme fausse</p>
        </div>
      </Phone>

      {OTHER_APPS.map(({ icon: Icon, label, position }, i) => (
        <div key={label} className={`absolute ${position}`}>
          <div className="tut-pop flex flex-col items-center" style={at(0.3 + i * 0.3)}>
            <span className="relative flex h-11 w-11 animate-fly items-center justify-center rounded-2xl bg-white text-navy shadow-lg ring-1 ring-navy/10">
              <Icon className="h-5 w-5" />
              <Strike delay={3.6 + i * 0.3} className="-right-1.5 -top-1.5 h-5 w-5" />
            </span>
            <span className="mt-1 rounded-full bg-white/80 px-1.5 text-[9px] font-bold text-navy">{label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function LiveVisual() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 h-6">
        <Pill tone="navy" delay={2.3}>
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-morocco-red" /> Débloquée par les organisateurs
        </Pill>
      </div>
      <Phone>
        <div
          className="tut-fade-out absolute inset-0 flex flex-col items-center justify-center px-3 text-center"
          style={at(2.9)}
        >
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-sky/25 [animation-duration:2s]" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 rotate-45" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
              </svg>
            </span>
          </span>
          <p className="mt-3 text-[10px] font-bold leading-snug">En attente de la prochaine question…</p>
          <p className="mt-1 text-[8px] text-navy/60">Gardez cette page ouverte</p>
        </div>
        <div className="tut-slide-up flex h-full flex-col" style={at(3.1)}>
          <span className="mb-1.5 self-start rounded-full bg-gold px-2 py-0.5 text-[8px] font-bold uppercase text-white">
            Nouvelle question !
          </span>
          <MiniQuestion label="Question 4 / 10" question="Quel est le drapeau du Maroc ?" />
          <div className="mt-2.5 space-y-1.5">
            {['Rouge, étoile verte', 'Vert et blanc', 'Bleu et rouge'].map((text, i) => (
              <Option key={text} letter={String.fromCharCode(65 + i)} text={text} />
            ))}
          </div>
        </div>
      </Phone>
    </div>
  )
}

const CONFETTI = [
  ['left-[8%] top-[12%]', 'bg-morocco-red', 0.5],
  ['right-[10%] top-[8%]', 'bg-morocco-green', 0.7],
  ['left-[18%] bottom-[22%]', 'bg-gold', 0.9],
  ['right-[16%] bottom-[30%]', 'bg-sky', 1.1],
  ['left-[30%] top-[4%]', 'bg-gold-light', 1.3],
  ['right-[28%] bottom-[12%]', 'bg-morocco-red', 1.5],
]

function EndVisual() {
  return (
    <div className="relative flex w-full flex-col items-center text-center">
      {CONFETTI.map(([position, color, delay]) => (
        <span key={position} className={`tut-pop absolute h-3 w-3 rotate-45 rounded-sm ${color} ${position}`} style={at(delay)} />
      ))}
      <span className="tut-pop flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold text-white shadow-xl ring-4 ring-white">
        <Trophy className="h-12 w-12" />
      </span>
      <p className="tut-in mt-4 font-display text-xl font-bold text-navy" style={at(0.6)}>
        Merci pour votre participation !
      </p>
      <p className="tut-in mt-1 text-sm font-semibold text-navy/70" style={at(1.1)}>
        Résultat affiché après la dernière question
      </p>
      <p className="tut-pop mt-4 font-display text-3xl font-bold text-morocco-red" style={at(2)}>
        Bonne chance ! ✈️
      </p>
    </div>
  )
}

const SCENES = [
  {
    title: 'Comment se déroule le quiz ?',
    narration:
      'Bienvenue au quiz de la Journée Talents ! En une minute, découvrez comment participer et les règles à respecter.',
    duration: 6,
    Visual: IntroVisual,
  },
  {
    badge: 'Étape 1',
    title: 'Inscrivez-vous',
    narration:
      'Renseignez votre nom, votre école et votre numéro de téléphone, puis appuyez sur « Commencer le quiz ».',
    duration: 7,
    Visual: RegisterVisual,
  },
  {
    badge: 'Étape 2',
    title: 'Répondez aux questions',
    narration: 'Les questions s’affichent une par une. Lisez bien, puis touchez la réponse de votre choix.',
    duration: 6,
    Visual: AnswerVisual,
  },
  {
    badge: 'Règle',
    title: 'Chaque question est chronométrée',
    narration:
      'Le compte à rebours démarre dès l’affichage de la question. Si le temps est écoulé, la réponse est comptée comme fausse.',
    duration: 8,
    Visual: TimerVisual,
  },
  {
    badge: 'Règle',
    title: 'Réponses définitives',
    narration: 'Une fois choisie, votre réponse ne peut plus être modifiée. Prenez le temps de bien lire.',
    duration: 6,
    Visual: FinalVisual,
  },
  {
    badge: 'Interdit',
    title: 'N’actualisez pas la page',
    narration:
      'N’actualisez pas la page et ne revenez pas en arrière pendant le quiz : la question en cours serait comptée comme « temps écoulé ».',
    duration: 8,
    Visual: RefreshVisual,
  },
  {
    badge: 'Interdit',
    title: 'Restez sur l’écran du quiz',
    narration:
      'Ne quittez pas l’écran du quiz : ouvrir un autre onglet ou une autre application (IA, recherche, messages…), ou réduire la fenêtre, fait passer la question. Elle est alors comptée comme fausse.',
    duration: 9,
    Visual: FocusVisual,
  },
  {
    badge: 'Étape 3',
    title: 'Questions débloquées en direct',
    narration:
      'Les organisateurs débloquent les questions en direct. Gardez la page ouverte : les nouvelles questions apparaissent automatiquement.',
    duration: 8,
    Visual: LiveVisual,
  },
  {
    badge: 'Étape 4',
    title: 'Fin du quiz',
    narration: 'Une fois toutes les questions répondues, votre participation est enregistrée. Bonne chance !',
    duration: 6,
    Visual: EndVisual,
  },
]

const BADGE_STYLES = {
  Règle: 'bg-gold text-white',
  Interdit: 'bg-morocco-red text-white',
}

function ControlButton({ label, onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-navy transition hover:bg-navy/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function QuizTutorial({ participant, onFinish }) {
  const [index, setIndex] = useState(0)
  const [run, setRun] = useState(0)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [ended, setEnded] = useState(false)
  const [voice, setVoice] = useState(false)
  const timeRef = useRef(0)
  const speakingRef = useRef(false)

  const scene = SCENES[index]
  const isLast = index === SCENES.length - 1
  const firstName = participant?.fullName?.split(' ')[0]

  const goTo = useCallback((next) => {
    timeRef.current = 0
    setIndex(next)
    setRun((r) => r + 1)
    setTime(0)
    setEnded(false)
    setPlaying(true)
  }, [])

  useEffect(() => {
    if (!playing || ended) return
    const id = setInterval(() => {
      const next = timeRef.current + TICK
      const waitingForVoice = speakingRef.current && next < scene.duration + MAX_SPEECH_WAIT
      if (next < scene.duration || waitingForVoice) {
        timeRef.current = next
        setTime(next)
      } else if (isLast) {
        setEnded(true)
      } else {
        goTo(index + 1)
      }
    }, TICK * 1000)
    return () => clearInterval(id)
  }, [playing, ended, scene.duration, isLast, index, goTo])

  useEffect(() => {
    if (!voice || !canSpeak) return
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(scene.narration)
    utterance.lang = 'fr-FR'
    const frenchVoice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith('fr'))
    if (frenchVoice) utterance.voice = frenchVoice
    const done = () => {
      speakingRef.current = false
    }
    utterance.onend = done
    utterance.onerror = done
    synth.cancel()
    synth.speak(utterance)
    speakingRef.current = true
    return () => {
      utterance.onend = null
      utterance.onerror = null
      synth.cancel()
      speakingRef.current = false
    }
  }, [voice, run, scene.narration])

  useEffect(() => {
    if (!voice || !canSpeak) return
    if (playing) window.speechSynthesis.resume()
    else window.speechSynthesis.pause()
  }, [playing, voice])

  const togglePlay = () => {
    if (ended) goTo(0)
    else setPlaying((p) => !p)
  }

  const { Visual } = scene
  const sceneProgress = Math.min(time / scene.duration, 1)
  const paused = !playing && !ended

  return (
    <div className="flex flex-1 flex-col animate-fade-up">
      <EventHeader compact />

      <section className="mt-4 rounded-2xl bg-white/90 p-3 shadow-xl ring-1 ring-navy/10 backdrop-blur sm:p-4">
        <div className="px-2 pb-3 pt-1 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold">Vidéo explicative</p>
          <h1 className="font-display text-xl font-bold text-navy">
            Avant de commencer{firstName ? `, ${firstName}` : ''}
          </h1>
        </div>

        <div
          role="region"
          aria-label="Vidéo explicative du quiz"
          className="relative overflow-hidden rounded-xl bg-sky-hero ring-1 ring-navy/10"
        >
          <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
            {SCENES.map((s, i) => {
              const fill = ended || i < index ? 1 : i === index ? sceneProgress : 0
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Aller à : ${s.title}`}
                  className="group h-3 flex-1 py-1"
                >
                  <span className="block h-1 overflow-hidden rounded-full bg-navy/15 group-hover:bg-navy/25">
                    <span
                      className="block h-full rounded-full bg-navy transition-[width] duration-100 ease-linear"
                      style={{ width: `${fill * 100}%` }}
                    />
                  </span>
                </button>
              )
            })}
          </div>

          <div
            key={run}
            className={`flex h-[440px] flex-col items-center px-3 pb-4 pt-9 sm:h-[450px] ${paused ? 'tut-paused' : ''}`}
          >
            <div className="tut-in flex flex-col items-center text-center">
              {scene.badge && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${BADGE_STYLES[scene.badge] ?? 'bg-navy text-white'}`}
                >
                  {scene.badge}
                </span>
              )}
              <h2 className="mt-1.5 font-display text-lg font-bold leading-tight text-navy sm:text-xl">
                {scene.title}
              </h2>
            </div>
            <div className="flex min-h-0 w-full flex-1 items-center justify-center pt-3">
              <Visual time={time} />
            </div>
          </div>

          {paused && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Reprendre la vidéo"
              className="absolute inset-0 z-30 flex items-center justify-center bg-navy-dark/30 backdrop-blur-[1px] animate-fade-in"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-navy shadow-2xl">
                <Play className="ml-1 h-7 w-7 fill-navy" />
              </span>
            </button>
          )}
        </div>

        <p
          aria-live="polite"
          className="mt-3 flex min-h-[4.5rem] items-center justify-center rounded-xl bg-navy px-4 py-3 text-center text-sm leading-relaxed text-white"
        >
          {scene.narration}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <ControlButton label="Précédent" onClick={() => goTo(Math.max(index - 1, 0))} disabled={index === 0}>
              <SkipBack className="h-4 w-4" />
            </ControlButton>
            <ControlButton label={ended ? 'Revoir' : playing ? 'Pause' : 'Lecture'} onClick={togglePlay}>
              {ended ? (
                <RotateCcw className="h-5 w-5" />
              ) : playing ? (
                <Pause className="h-5 w-5 fill-navy" />
              ) : (
                <Play className="h-5 w-5 fill-navy" />
              )}
            </ControlButton>
            <ControlButton label="Suivant" onClick={() => goTo(index + 1)} disabled={isLast}>
              <SkipForward className="h-4 w-4" />
            </ControlButton>
          </div>

          <span className="text-xs font-semibold tabular-nums text-navy/60">
            {index + 1} / {SCENES.length}
          </span>

          {canSpeak ? (
            <button
              type="button"
              onClick={() => setVoice((v) => !v)}
              aria-pressed={voice}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                voice ? 'bg-navy text-white' : 'bg-navy/5 text-navy hover:bg-navy/10'
              }`}
            >
              {voice ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Voix
            </button>
          ) : (
            <span className="w-9" />
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={onFinish}
        className={`mt-4 w-full rounded-xl py-3.5 font-semibold uppercase tracking-wider shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
          ended ? 'tut-pop bg-navy text-white hover:bg-navy-dark' : 'bg-white/80 text-navy ring-1 ring-navy/15 hover:bg-white'
        }`}
      >
        {ended ? 'J’ai compris, continuer' : 'Passer la vidéo'}
      </button>
    </div>
  )
}

export default QuizTutorial
