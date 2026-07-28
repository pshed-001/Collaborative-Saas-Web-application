import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
import ThemeToggle from '../components/theme-toggle'

export default function Maintenance() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', padding: '0 16px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', maxWidth: '420px' }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{
            width: '64px', height: '64px', borderRadius: '16px',
            backgroundColor: 'rgba(10,112,117,0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          }}
        >
          <Wrench size={32} style={{ color: 'var(--accent)' }} />
        </motion.div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Under Maintenance
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          We're currently performing scheduled maintenance to improve your experience. We'll be back soon.
        </p>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            height: '4px', width: '120px', borderRadius: '2px',
            backgroundColor: 'var(--accent)', margin: '0 auto',
          }}
        />
      </motion.div>
    </div>
  )
}
