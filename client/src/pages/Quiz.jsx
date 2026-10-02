import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import SkyBackground from '../components/SkyBackground.jsx'
import EventIntro from '../components/quiz/EventIntro.jsx'
import ParticipantForm from '../components/quiz/ParticipantForm.jsx'
import QuizQuestions from '../components/quiz/QuizQuestions.jsx'
import QuizWaiting from '../components/quiz/QuizWaiting.jsx'
import QuizResult from '../components/quiz/QuizResult.jsx'

const CLOSED_POLL_MS = 15000
const WAITING_POLL_MS = 4000

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
  const [step, setStep] = useState('intro')
  const [quiz, setQuiz] = useState({ loaded: false, active: false, total: 0 })
  const [participant, setParticipant] = useState(null)
  const [token, setToken] = useState(null)
  const [queue, setQueue] = useState({ round: 0, questions: [] })
  const [progress, setProgress] = useState({ total: 0, answered: 0 })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
    if (state.completed) return setStep('result')
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
      } catch {
        setError('Connexion instable : nouvelle tentative automatique…')
        setStep('waiting')
      } finally {
        setSubmitting(false)
      }
    },
    [applyState],
  )

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
    sync([], attempt.token)
  }

  const sendAnswer = useCallback(
    (answer) => {
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

      {step === 'intro' && (
        <EventIntro
          onStart={() => setStep('register')}
          loaded={quiz.loaded}
          active={quiz.active}
          questionCount={quiz.total || null}
        />
      )}

      {step === 'register' && <ParticipantForm onRegistered={register} onBack={() => setStep('intro')} />}

      {step === 'questions' && queue.questions.length > 0 && (
        <QuizQuestions
          key={queue.round}
          questions={queue.questions}
          answeredCount={progress.answered}
          total={progress.total}
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
