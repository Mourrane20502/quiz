import { useEffect, useState } from 'react'
import axios from 'axios'
import LandingPage from '../components/landing/LandingPage.jsx'
import { useContent } from '../content/ContentContext.js'
import { quizUrl } from '../lib/quizUrl.js'

const POLL_MS = 10000

function FollowHome() {
  const content = useContent()
  const [active, setActive] = useState(null)

  useEffect(() => {
    const load = () =>
      axios
        .get('/api/quiz')
        .then(({ data }) => setActive(data.active))
        .catch(() => setActive(null))

    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <LandingPage
      open={active !== false}
      statusLabels={{ open: 'Suivi en direct', closed: 'Ouverture prochaine' }}
      title={content.followTitle}
      highlight={content.followTitleHighlight}
      description={content.followDescription}
      qr={{
        url: quizUrl,
        eyebrow: 'Accès participant',
        title: 'Scannez pour jouer',
        linkTo: '/public',
        linkLabel: 'Voir les questions',
      }}
    />
  )
}

export default FollowHome
