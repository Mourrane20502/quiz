import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import axios from 'axios'
import { DEFAULT_CONTENT } from '../data/content.js'
import { ContentContext } from './ContentContext.js'

const LOAD_TIMEOUT_MS = 4000

function PublicContent() {
  const [content, setContent] = useState(null)

  useEffect(() => {
    let cancelled = false
    axios
      .get('/api/content', { timeout: LOAD_TIMEOUT_MS })
      .then(({ data }) => !cancelled && setContent({ ...DEFAULT_CONTENT, ...data }))
      .catch(() => !cancelled && setContent(DEFAULT_CONTENT))
    return () => {
      cancelled = true
    }
  }, [])

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-hero">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-navy/15 border-t-navy" />
      </div>
    )
  }

  return (
    <ContentContext.Provider value={content}>
      <Outlet />
    </ContentContext.Provider>
  )
}

export default PublicContent
