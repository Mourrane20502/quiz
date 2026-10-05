import { useEffect, useRef } from 'react'

// Browsers never allow a page to fully block reloads: this disables the shortcuts and the
// back button, and asks for confirmation before the page is reloaded or closed.
export function useLeaveGuard(enabled, onBlocked) {
  const onBlockedRef = useRef(onBlocked)

  useEffect(() => {
    onBlockedRef.current = onBlocked
  }, [onBlocked])

  useEffect(() => {
    if (!enabled) return

    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    const onKeyDown = (e) => {
      const key = e.key?.toLowerCase()
      if (key === 'f5' || ((e.ctrlKey || e.metaKey) && key === 'r')) {
        e.preventDefault()
        onBlockedRef.current?.()
      }
    }
    const onPopState = () => {
      window.history.pushState(null, '', window.location.href)
      onBlockedRef.current?.()
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('popstate', onPopState)
    const root = document.documentElement
    const previousOverscroll = root.style.overscrollBehaviorY
    root.style.overscrollBehaviorY = 'none'

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('popstate', onPopState)
      root.style.overscrollBehaviorY = previousOverscroll
    }
  }, [enabled])
}
