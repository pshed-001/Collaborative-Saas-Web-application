import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import Button from '../components/ui/button'
import useAuthStore from '../stores/auth-store'

export default function NotFound() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', padding: '0 16px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '72px', fontWeight: 800, color: 'rgba(10,112,117,0.1)', marginBottom: '16px' }}>404</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Page not found</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to={isAuthenticated ? '/dashboard' : '/'} style={{ display: 'inline-block', marginTop: '24px' }}>
          <Button><Home size={16} /> Go Home</Button>
        </Link>
      </motion.div>
    </div>
  )
}
