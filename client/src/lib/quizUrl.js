const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const baseUrl = import.meta.env.VITE_APP_URL || (isLocalhost ? __LAN_URL__ : window.location.origin)

export const quizUrl = `${baseUrl.replace(/\/$/, '')}/quiz`
