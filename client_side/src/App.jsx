import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from './stores/auth-store'
import { useEffect, useState, Suspense, lazy } from 'react'
import { apiRefresh } from './lib/api'
import { motion } from 'framer-motion'

import AppLayout from './components/layout/app-layout'
import ErrorBoundary from './components/error-boundary'
import ToastContainer from './components/ui/toast'
import Skeleton from './components/ui/skeleton'

const Landing = lazy(() => import('./pages/landing'))
const Login = lazy(() => import('./pages/login'))
const Register = lazy(() => import('./pages/register'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const Discover = lazy(() => import('./pages/discover'))
const WorkspaceDetail = lazy(() => import('./pages/workspace-detail'))
const TaskDetail = lazy(() => import('./pages/task-detail'))
const Trash = lazy(() => import('./pages/trash'))
const Profile = lazy(() => import('./pages/profile'))
const NotFound = lazy(() => import('./pages/not-found'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, err) => {
        if (err?.status === 429) return false
        return count < 2
      },
      refetchOnWindowFocus: false,
    },
  },
})

function AuthGate({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <SplashScreen />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestGate({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return null
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function SplashScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}
        >I</motion.div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ height: '4px', width: '96px', borderRadius: '2px', backgroundColor: 'var(--accent)', opacity: 0.4 }}
        />
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 0 32px' }}>
      <Skeleton style={{ height: 28, width: 200, borderRadius: 8 }} />
      <Skeleton style={{ height: 16, width: 320, borderRadius: 6 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 8 }}>
        <Skeleton style={{ height: 160, borderRadius: 12 }} />
        <Skeleton style={{ height: 160, borderRadius: 12 }} />
        <Skeleton style={{ height: 160, borderRadius: 12 }} />
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <AnimatePresence>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<GuestGate><Landing /></GuestGate>} />
          <Route path="/login" element={<GuestGate><Login /></GuestGate>} />
          <Route path="/register" element={<GuestGate><Register /></GuestGate>} />

          <Route element={<AuthGate><AppLayout /></AuthGate>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/workspace/:id" element={<WorkspaceDetail />} />
            <Route path="/workspace/:id/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

function AppInit() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function restore() {
      try {
        const { token } = await apiRefresh()
        if (cancelled) return
        const user = useAuthStore.getState().user
        if (token) {
          useAuthStore.setState({ user, accessToken: token, isAuthenticated: true, isLoading: false })
        } else {
          useAuthStore.setState({ isLoading: false })
        }
      } catch {
        if (!cancelled) {
          useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
        }
      }
      if (!cancelled) setReady(true)
    }
    restore()
    return () => { cancelled = true }
  }, [])

  if (!ready) return <SplashScreen />

  return <AppRoutes />
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppInit />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
