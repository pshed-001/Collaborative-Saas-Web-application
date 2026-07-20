import { create } from 'zustand'

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved) {
  const root = document.documentElement
  root.classList.add('theme-transition')
  root.setAttribute('data-theme', resolved)
  setTimeout(() => root.classList.remove('theme-transition'), 350)
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'system'
  return localStorage.getItem('itgel_theme_mode') || 'system'
}

function resolveTheme(theme) {
  return theme === 'system' ? getSystemTheme() : theme
}

const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),
  resolvedTheme: resolveTheme(getInitialTheme()),

  setTheme: (theme) => {
    const resolved = resolveTheme(theme)
    localStorage.setItem('itgel_theme_mode', theme)
    localStorage.setItem('itgel_theme', resolved)
    applyTheme(resolved)
    set({ theme, resolvedTheme: resolved })
  },

  toggleTheme: () => {
    const current = get().resolvedTheme
    const next = current === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  initTheme: () => {
    const theme = getInitialTheme()
    const resolved = resolveTheme(theme)
    document.documentElement.setAttribute('data-theme', resolved)
    set({ theme, resolvedTheme: resolved })
  },
}))

export default useThemeStore
