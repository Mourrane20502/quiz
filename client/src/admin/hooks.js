import { useCallback, useEffect, useRef, useState } from 'react'

export function usePolling(fetcher, intervalMs) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(null)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const reload = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
      setUpdatedAt(new Date())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload, fetcher])

  useEffect(() => {
    if (!intervalMs) return
    const id = setInterval(() => {
      if (!document.hidden) reload()
    }, intervalMs)
    return () => clearInterval(id)
  }, [reload, intervalMs])

  return { data, error, loading, updatedAt, reload }
}

export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (target === null || target === undefined || Number.isNaN(target)) return
    const from = fromRef.current
    const start = performance.now()
    let frame

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (target - from) * eased
      setValue(current)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = target
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      fromRef.current = target
    }
  }, [target, duration])

  return value
}

export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
