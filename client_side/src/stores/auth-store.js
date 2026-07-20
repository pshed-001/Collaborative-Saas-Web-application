import { create } from 'zustand'

const USER_KEY = 'itgel_user'

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {} // eslint-disable-line no-empty
}

const useAuthStore = create((set) => ({
  user: loadUser(),
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, accessToken) => {
    saveUser(user)
    set({ user, accessToken, isAuthenticated: true, isLoading: false })
  },

  setAccessToken: (accessToken) => set({ accessToken }),

  logout: () => {
    saveUser(null)
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
  },

  setLoading: (isLoading) => set({ isLoading }),
}))

export default useAuthStore
