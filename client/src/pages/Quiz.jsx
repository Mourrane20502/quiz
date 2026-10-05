import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import SkyBackground from '../components/SkyBackground.jsx'
import EventIntro from '../components/quiz/EventIntro.jsx'
import ParticipantForm from '../components/quiz/ParticipantForm.jsx'
import QuizRules from '../components/quiz/QuizRules.jsx'
import QuizQuestions from '../components/quiz/QuizQuestions.jsx'
import QuizWaiting from '../components/quiz/QuizWaiting.jsx'
import QuizResult from '../components/quiz/QuizResult.jsx'
import { clearSession, loadSession, saveSession } from '../components/quiz/session.js'
import { useLeaveGuard } from '../components/quiz/useLeaveGuard.js'

const CLOSED_POLL_MS = 15000
const WAITING_POLL_MS = 4000
const NOTICE_MS = 4000
const GUARDED_STEPS = ['resuming', 'rules', 'questions', 'waiting']

async function postWithRetry(url, body, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      return await axios.post(url, body)
    } catch (err) {
      if (i >= attempts || (err.response && err.response.status < 500)) throw err
      await new Promise((r) => setTimeout(r, 800 * i))
    }
  }
}

function Quiz() {
  const [savedSession] = useState(loadSession)
  const [step, setStep] = useState(savedSession?.token ? 'resuming' : 'intro')
  const [quiz, setQuiz] = useState({ loaded: false, active: false, total: 0 })
  const [participant, setParticipant] = useState(savedSession?.participant ?? null)
  const [token, setToken] = useState(savedSession?.token ?? null)
  const [queue, setQueue] = useState({ round: 0, questions: [] })
  const [progress, setProgress] = useState({ total: 0, answered: 0 })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const resumeStarted = useRef(false)

  const showNotice = useCallback((message) => setNotice(message), [])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), NOTICE_MS)
    return () => clearTimeout(id)
  }, [notice])

  useLeaveGuard(GUARDED_STEPS.includes(step), () =>
    showNotice('Actualiser ou quitter la page est désactivé pendant le quiz.'),
  )

  const loadQuiz = useCallback(() => {
    return axios
      .get('/api/quiz')
      .then(({ data }) => {
        setQuiz({ loaded: true, active: data.active, total: data.total })
        setError('')
      })
      .catch(() => setError('Impossible de charger le quiz. Vérifiez votre connexion.'))
  }, [])

  useEffect(() => {
    loadQuiz()
  }, [loadQuiz])

  useEffect(() => {
    if (step !== 'intro' || !quiz.loaded || quiz.active) return
    const id = setInterval(loadQuiz, CLOSED_POLL_MS)
    return () => clearInterval(id)
  }, [step, quiz.loaded, quiz.active, loadQuiz])

  const applyState = useCallback((state) => {
    if (state.completed) {
      clearSession()
      return setStep('result')
    }
    setProgress({ total: state.total, answered: state.answered })
    if (state.questions.length) {
      setQueue((prev) => ({ round: prev.round + 1, questions: state.questions }))
      setStep('questions')
    } else {
      setStep('waiting')
    }
  }, [])

  const sync = useCallback(
    async (answers, attemptToken) => {
      setSubmitting(true)
      try {
        const { data } = await postWithRetry('/api/quiz/sync', { token: attemptToken, answers })
        setError('')
        applyState(data)
      } catch (err) {
        if (err.response?.status === 401) {
          clearSession()
          setToken(null)
          setError('Votre session a expiré. Veuillez vous réinscrire avec le même numéro.')
          setStep('intro')
        } else {
          setError('Connexion instable : nouvelle tentative automatique…')
          setStep('waiting')
        }
      } finally {
        setSubmitting(false)
      }
    },
    [applyState],
  )

  useEffect(() => {
    if (step !== 'resuming' || resumeStarted.current) return
    resumeStarted.current = true
    const { token: savedToken, pendingQuestionId } = savedSession
    const resume = async () => {
      if (pendingQuestionId) {
        await axios
          .post('/api/quiz/answer', { token: savedToken, questionId: pendingQuestionId, selectedIndex: null })
          .catch(() => {})
        saveSession({ pendingQuestionId: null })
        showNotice('La page a été actualisée : la question en cours a été comptée comme « temps écoulé ».')
      }
      await sync([], savedToken)
    }
    resume()
  }, [step, savedSession, sync, showNotice])

  useEffect(() => {
    if (step !== 'waiting' || !token) return
    const id = setInterval(() => {
      axios
        .post('/api/quiz/state', { token })
        .then(({ data }) => {
          setError('')
          applyState(data)
        })
        .catch(() => {})
    }, WAITING_POLL_MS)
    return () => clearInterval(id)
  }, [step, token, applyState])

  const register = ({ participant: registered, attempt }) => {
    setParticipant(registered)
    setToken(attempt.token)
    saveSession({ token: attempt.token, participant: registered, pendingQuestionId: null })
    setStep('rules')
  }

  const markQuestionShown = useCallback((questionId) => saveSession({ pendingQuestionId: questionId }), [])

  const sendAnswer = useCallback(
    (answer) => {
      saveSession({ pendingQuestionId: null })
      axios.post('/api/quiz/answer', { token, ...answer }).catch(() => {})
    },
    [token],
  )

  const finishQueue = useCallback((answers) => sync(answers, token), [sync, token])

  return (
    <SkyBackground>
      {error && (
        <div className="mb-4 rounded-xl bg-morocco-red/90 px-4 py-3 text-sm text-white shadow">{error}</div>
      )}

      {notice && (
        <div
          role="status"
          className="fixed inset-x-4 top-4 z-[60] mx-auto max-w-md rounded-xl bg-navy px-4 py-3 text-center text-sm font-semibold text-white shadow-xl animate-fade-in"
        >
          {notice}
        </div>
      )}

      {step === 'intro' && (
        <EventIntro
          onStart={() => setStep('register')}
          loaded={quiz.loaded}
          active={quiz.active}
          questionCount={quiz.total || null}
        />
      )}

      {step === 'register' && <ParticipantForm onRegistered={register} onBack={() => setStep('intro')} />}

      {step === 'resuming' && (
        <p className="mt-16 text-center font-semibold text-navy">Reprise de votre quiz…</p>
      )}

      {step === 'rules' && <QuizRules participant={participant} onAccept={() => sync([], token)} loading={submitting} />}

      {step === 'questions' && queue.questions.length > 0 && (
        <QuizQuestions
          key={queue.round}
          questions={queue.questions}
          answeredCount={progress.answered}
          total={progress.total}
          onQuestionShown={markQuestionShown}
          onAnswered={sendAnswer}
          onQueueEnd={finishQueue}
          submitting={submitting}
        />
      )}

      {step === 'waiting' && <QuizWaiting participant={participant} progress={progress} />}

      {step === 'result' && <QuizResult participant={participant} />}
    </SkyBackground>
  )
}

export default Quiz
