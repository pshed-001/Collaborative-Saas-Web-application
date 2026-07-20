import { useState, useEffect, useCallback } from 'react'

let toastId = 0
let listeners = []
let toasts = []

function notifyListeners() {
  listeners.forEach((l) => l([...toasts]))
}

function addToast({ title, description, variant = 'default', duration = 4000 }) {
  const id = ++toastId
  const t = { id, title, description, variant }
  toasts = [...toasts, t]
  notifyListeners()
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== id)
    notifyListeners()
  }, duration)
  return id
}

export function toast(props) {
  return addToast(props)
}

toast.success = (title, description) => addToast({ title, description, variant: 'success' })
toast.error = (title, description) => addToast({ title, description, variant: 'error' })
toast.warning = (title, description) => addToast({ title, description, variant: 'warning' })
toast.info = (title, description) => addToast({ title, description, variant: 'default' })

export function useToast() {
  const [currentToasts, setToasts] = useState(toasts)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((l) => l !== setToasts)
    }
  }, [])

  const dismiss = useCallback((id) => {
    toasts = toasts.filter((t) => t.id !== id)
    notifyListeners()
  }, [])

  return { toasts: currentToasts, toast, dismiss }
}
