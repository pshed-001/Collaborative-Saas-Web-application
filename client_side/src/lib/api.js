import axios from 'axios'
import useAuthStore from '../stores/auth-store'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const refreshClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && !original.url.startsWith('/auth')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original))
      }
      original._retry = true
      isRefreshing = true
      try {
        const res = await refreshClient.post('/auth/refresh')
        const auth = res.headers['authorization']
        const newToken = auth ? auth.replace(/^Bearer\s+/i, '') : null
        if (newToken) {
          useAuthStore.getState().setAccessToken(newToken)
          processQueue(null)
          return api(original)
        }
        processQueue(new Error('No token'))
        useAuthStore.getState().logout()
        return Promise.reject(error)
      } catch (e) {
        processQueue(e)
        useAuthStore.getState().logout()
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

function extractPayload(res) {
  const body = res.data
  if (body.error) {
    const err = new Error(body.message || 'Request failed')
    err.status = res.status
    err.data = body.data
    throw err
  }
  return body.data?.payload ?? body.data
}

export function getErrorMessage(err) {
  const status = err?.response?.status || err?.status

  if (status === 500) return 'Something went wrong. Please try again.'
  if (status === 404) return 'Resource not found.'

  const backendMsg = err?.response?.data?.message || err?.message
  if (Array.isArray(backendMsg)) {
    return backendMsg.map(e => e.msg || e.message || String(e)).filter(Boolean).join('. ')
  }
  if (typeof backendMsg === 'string' && backendMsg) return backendMsg

  return 'An unexpected error occurred.'
}

function extractToken(res) {
  const auth = res.headers['authorization']
  return auth ? auth.replace(/^Bearer\s+/i, '') : null
}

export async function apiPost(url, data) {
  const res = await api.post(url, data)
  return { payload: extractPayload(res), token: extractToken(res), response: res }
}

export async function apiGet(url, params) {
  const res = await api.get(url, { params })
  return extractPayload(res)
}

export async function apiPatch(url, data) {
  const res = await api.patch(url, data)
  return extractPayload(res)
}

export async function apiDelete(url) {
  const res = await api.delete(url)
  return extractPayload(res)
}

export async function apiRefresh() {
  const res = await refreshClient.post('/auth/refresh')
  return { token: extractToken(res), response: res }
}

export default api
