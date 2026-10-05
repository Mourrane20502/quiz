import { useEffect, useState } from 'react'
import axios from 'axios'
import LandingPage from '../components/landing/LandingPage.jsx'
import { STEP_ICONS } from '../components/landing/stepIcons.jsx'
import { useContent } from '../content/ContentContext.js'
import { quizUrl } from '../lib/quizUrl.js'

const ICONS = [STEP_ICONS.scan, STEP_ICONS.user, STEP_ICONS.plane]

function Home() {
  const content = useContent()
  const [quizInfo, setQuizInfo] = useState(null)
  const steps = [1, 2, 3].map((n, i) => ({
    title: content[`step${n}Title`],
    text: content[`step${n}Text`],
    icon: ICONS[i],
  }))

  useEffect(() => {
    const load = () =>
      axios
        .get('/api/quiz')
        .then(({ data }) => {
          const limits = data.questions.map((q) => q.timeLimit)
          setQuizInfo({
            active: data.active,
            total: data.total || null,
            minTime: limits.length ? Math.min(...limits) : null,
          })
        })
        .catch(() => setQuizInfo(null))

    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <LandingPage
      open={quizInfo?.active !== false}
      statusLabels={{ open: 'Quiz en direct', closed: 'Ouverture prochaine' }}
      title={content.homeTitle}
      highlight={content.homeTitleHighlight}
      description={content.homeDescription}
      steps={steps}
      stats={[
        { value: quizInfo?.total ?? '—', label: 'Questions' },
        { value: quizInfo?.minTime ? `${quizInfo.minTime}s` : '—', label: 'Par question' },
        { value: '1', label: 'Seule tentative' },
      ]}
      qr={{
        url: quizUrl,
        eyebrow: 'Accès participant',
        title: 'Scannez pour jouer',
        linkTo: '/quiz',
        linkLabel: 'Jouer sur cet appareil',
      }}
    />
  )
}

export default Home
