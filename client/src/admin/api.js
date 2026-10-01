import axios from 'axios'

const TOKEN_KEY = 'quiz_admin_token'
const USER_KEY = 'quiz_admin_user'

export const auth = {
  get token() {
    return localStorage.getItem(TOKEN_KEY)
  },
  get username() {
    return localStorage.getItem(USER_KEY)
  },
  save(token, username) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, username)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

const api = axios.create({ baseURL: '/api/admin' })

api.interceptors.request.use((config) => {
  const token = auth.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url?.endsWith('/login')) {
      auth.clear()
      if (window.location.pathname !== '/admin') window.location.assign('/admin')
    }
    return Promise.reject(err)
  },
)

export async function downloadFile(url, params) {
  const res = await api.get(url, { params, responseType: 'blob' })
  const disposition = res.headers['content-disposition'] ?? ''
  const filename = /filename="?([^"]+)"?/.exec(disposition)?.[1] ?? 'export'
  const href = URL.createObjectURL(res.data)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(href)
}

export const errorMessage = (err, fallback = 'Une erreur est survenue.') => err?.response?.data?.message ?? fallback

export default api
