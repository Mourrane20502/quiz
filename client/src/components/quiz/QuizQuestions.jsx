import { useCallback, useEffect, useRef, useState } from 'react'
import EventHeader from '../EventHeader.jsx'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const TICK_MS = 100
const BLUR_GRACE_MS = 1500
const SKIPPED_NOTICE_MS = 2500

function QuestionCard({ question, onShown, onAnswer }) {
  const limitMs = question.timeLimit * 1000
  const [deadline] = useState(() => Date.now() + limitMs)
  const [msLeft, setMsLeft] = useState(limitMs)
  const [selected, setSelected] = useState(undefined)
  const [skipped, setSkipped] = useState(false)
  const answered = useRef(false)

  useEffect(() => {
    onShown?.(question.id)
  }, [question.id, onShown])

  const answer = useCallback(
    (choice) => {
      if (answered.current) return
      answered.current = true
      setSelected(choice)
      const responseTimeMs = Math.min(Date.now() - (deadline - limitMs), limitMs)
      setTimeout(() => onAnswer(choice, responseTimeMs), choice === null ? 1000 : 500)
    },
    [onAnswer, deadline, limitMs],
  )

  // Leaving the quiz screen (other tab, other app such as an AI assistant, minimized window)
  // forfeits the question. The next question waits until the participant is back, so it
  // doesn't start its timer while nobody is looking.
  const skip = useCallback(() => {
    if (answered.current) return
    answered.current = true
    setSelected(null)
    setSkipped(true)

    const advance = () => setTimeout(() => onAnswer(null, limitMs), SKIPPED_NOTICE_MS)
    if (!document.hidden) return advance()
    const onVisible = () => {
      if (document.hidden) return
      document.removeEventListener('visibilitychange', onVisible)
      advance()
    }
    document.addEventListener('visibilitychange', onVisible)
  }, [onAnswer, limitMs])

  useEffect(() => {
    let blurTimer
    const onVisibility = () => document.hidden && skip()
    const onBlur = () => {
      clearTimeout(blurTimer)
      blurTimer = setTimeout(() => !document.hasFocus() && skip(), BLUR_GRACE_MS)
    }
    const onFocus = () => clearTimeout(blurTimer)

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      clearTimeout(blurTimer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [skip])

  useEffect(() => {
    const id = setInterval(() => {
      if (answered.current) return clearInterval(id)
      const remaining = Math.max(0, deadline - Date.now())
      setMsLeft(remaining)
      if (remaining === 0) {
        clearInterval(id)
        answer(null)
      }
    }, TICK_MS)
    return () => clearInterval(id)
  }, [deadline, answer])

  const seconds = Math.ceil(msLeft / 1000)
  const ratio = msLeft / limitMs
  const urgent = seconds <= 5
  const timedOut = selected === null && !skipped
  const isTrueFalse = question.type === 'true_false'

  return (
    <div className="animate-fade-up">
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/60">
          <div
            className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
              urgent ? 'bg-morocco-red' : 'bg-navy'
            }`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow ${
            urgent ? 'animate-pulse bg-morocco-red' : 'bg-navy'
          }`}
        >
          {seconds}
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-white/90 p-5 shadow-xl ring-1 ring-navy/10 backdrop-blur">
        {isTrueFalse && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gold">Vrai ou faux</p>
        )}
        <h2 className="font-display text-xl font-bold leading-snug text-navy">{question.question}</h2>

        <ul className={`mt-5 gap-3 ${isTrueFalse ? 'grid grid-cols-2' : 'space-y-3'}`}>
          {question.options.map((option, index) => {
            const active = selected === index
            const dimmed = selected !== undefined && !active
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => answer(index)}
                  disabled={selected !== undefined}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    isTrueFalse ? 'justify-center py-5 text-base font-semibold' : ''
                  } ${
                    active
                      ? 'border-navy bg-navy text-white shadow-md'
                      : 'border-navy/15 bg-white text-navy hover:border-gold hover:bg-gold/5'
                  } ${dimmed ? 'opacity-40' : ''}`}
                >
                  {!isTrueFalse && (
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        active ? 'bg-gold text-white' : 'bg-navy/5 text-navy'
                      }`}
                    >
                      {LETTERS[index]}
                    </span>
                  )}
                  <span>{option}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {timedOut && (
          <p className="mt-4 rounded-lg bg-morocco-red/10 py-2 text-center text-sm font-semibold text-morocco-red">
            Temps écoulé !
          </p>
        )}

        {skipped && (
          <div role="alert" className="mt-4 rounded-lg bg-morocco-red/10 px-3 py-2.5 text-center text-morocco-red">
            <p className="text-sm font-bold">Question passée</p>
            <p className="mt-0.5 text-xs">
              Vous avez quitté l’écran du quiz : cette question est comptée comme fausse.
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-navy/55">
        Restez sur cet écran : changer d’onglet ou d’application fait passer la question.
      </p>
    </div>
  )
}

function QuizQuestions({ questions, answeredCount = 0, total, onQuestionShown, onAnswered, onQueueEnd, submitting }) {
  const [current, setCurrent] = useState(0)
  const answers = useRef([])

  const question = questions[current]
  const isLast = current === questions.length - 1
  const position = answeredCount + current + 1
  const totalCount = Math.max(total, position)
  const progress = (position / totalCount) * 100

  const handleAnswer = useCallback(
    (choice, responseTimeMs) => {
      const answer = { questionId: question.id, selectedIndex: choice, responseTimeMs }
      answers.current = [...answers.current, answer]
      onAnswered?.(answer)
      if (isLast) onQueueEnd(answers.current)
      else setCurrent((c) => c + 1)
    },
    [question.id, isLast, onAnswered, onQueueEnd],
  )

  return (
    <div className="flex flex-1 flex-col">
      <EventHeader compact />

      <div className="mt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-navy">
          <span>
            Question {position} / {totalCount}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-morocco-red via-gold to-morocco-green transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {submitting ? (
        <p className="mt-10 text-center font-semibold text-navy">Enregistrement de vos réponses…</p>
      ) : (
        <QuestionCard key={question.id} question={question} onShown={onQuestionShown} onAnswer={handleAnswer} />
      )}
    </div>
  )
}

export default QuizQuestions
