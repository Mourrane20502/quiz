const KEY = 'quiz_session'

export function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) ?? null
  } catch {
    return null
  }
}

export function saveSession(patch) {
  sessionStorage.setItem(KEY, JSON.stringify({ ...loadSession(), ...patch }))
}

export function clearSession() {
  sessionStorage.removeItem(KEY)
}
