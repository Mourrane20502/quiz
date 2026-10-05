import { useEffect, useState } from 'react'
import axios from 'axios'
import LandingPage from '../components/landing/LandingPage.jsx'
import { useContent } from '../content/ContentContext.js'
import { publicBoardUrl } from '../lib/quizUrl.js'

const POLL_MS = 10000

function FollowHome() {
  const content = useContent()
  const [quizInfo, setQuizInfo] = useState(null)

  useEffect(() => {
    const load = () =>
      axios
        .get('/api/quiz')
        .then(({ data }) =>
          setQuizInfo({ active: data.active, unlocked: data.questions.length, total: data.total || null }),
        )
        .catch(() => setQuizInfo(null))

    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <LandingPage
      open={quizInfo?.active !== false}
      statusLabels={{ open: 'Suivi en direct', closed: 'Ouverture prochaine' }}
      title={content.followTitle}
      highlight={content.followTitleHighlight}
      description={content.followDescription}
      stats={[
        { value: quizInfo ? quizInfo.unlocked : '—', label: 'Débloquées' },
        { value: quizInfo?.total ?? '—', label: 'Questions' },
        { value: '0', label: 'Inscription requise' },
      ]}
      qr={{
        url: publicBoardUrl,
        eyebrow: 'Accès public',
        title: 'Scannez pour suivre',
        linkTo: '/public',
        linkLabel: 'Voir les questions',
      }}
    />
  )
}

export default FollowHome
