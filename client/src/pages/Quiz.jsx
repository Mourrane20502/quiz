import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import SkyBackground from '../components/SkyBackground.jsx'
import EventIntro from '../components/quiz/EventIntro.jsx'
import ParticipantForm from '../components/quiz/ParticipantForm.jsx'
import QuizQuestions from '../components/quiz/QuizQuestions.jsx'
import QuizResult from '../components/quiz/QuizResult.jsx'

const CLOSED_POLL_MS = 15000

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
  const [quiz, setQuiz] = useState({ loaded: false, active: false, questions: [] })
  const [participant, setParticipant] = useState(null)
  const [token, setToken] = useState(null)
  const [remaining, setRemaining] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadQuiz = useCallback(() => {
    return axios
      .get('/api/quiz')
      .then(({ data }) => {
        setQuiz({ loaded: true, active: data.active, questions: data.questions })
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

  const finish = useCallback(
    async (answers, attemptToken = token) => {
      setSubmitting(true)
      try {
        await postWithRetry('/api/quiz/finish', { token: attemptToken, answers })
        setStep('result')
      } catch {
        setError('Une erreur est survenue lors de l’envoi de vos réponses. Réessayez.')
      } finally {
        setSubmitting(false)
      }
    },
    [token],
  )

  const register = ({ participant: registered, attempt }) => {
    const answered = new Set(attempt.answeredIds)
    const left = quiz.questions.filter((q) => !answered.has(q.id))
    setParticipant(registered)
    setToken(attempt.token)
    setRemaining(left)
    if (left.length === 0) finish([], attempt.token)
    else setStep('questions')
  }

  const sendAnswer = useCallback(
    (answer) => {
      axios.post('/api/quiz/answer', { token, ...answer }).catch(() => {})
    },
    [token],
  )

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
          questionCount={quiz.questions.length || null}
        />
      )}

      {step === 'register' && <ParticipantForm onRegistered={register} onBack={() => setStep('intro')} />}

      {step === 'questions' && remaining.length > 0 && (
        <QuizQuestions
          questions={remaining}
          alreadyAnswered={quiz.questions.length - remaining.length}
          onAnswered={sendAnswer}
          onFinish={finish}
          submitting={submitting}
        />
      )}

      {step === 'result' && <QuizResult participant={participant} />}
    </SkyBackground>
  )
}

export default Quiz
