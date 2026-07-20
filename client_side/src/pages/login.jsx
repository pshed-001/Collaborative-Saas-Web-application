import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { apiPost, getErrorMessage } from '../lib/api'
import useAuthStore from '../stores/auth-store'
import { toast } from '../hooks/use-toast'
import Button from '../components/ui/button'
import Input from '../components/ui/input'
import Label from '../components/ui/label'
import SlideshowBackground from '../components/slideshow-background'
import ThemeToggle from '../components/theme-toggle'
import { Eye, EyeOff } from 'lucide-react'
import styles from './auth.module.css'

const schema = z.object({
  userInput: z.string().min(1, 'Email or username is required'),
  password: z.string().min(10, 'Password must be at least 10 characters'),
})

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data) {
    try {
      const { payload, token } = await apiPost('/auth/login', data)
      if (token) {
        setAuth(payload, token)
        navigate('/dashboard')
      } else {
        toast.error('Login failed', 'No access token received.')
      }
    } catch (err) {
      toast.error('Login failed', getErrorMessage(err))
    }
  }

  return (
    <div className={styles.authPage}>
      <SlideshowBackground />
      <div className={styles.themeCorner}><ThemeToggle /></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoMark}><span>I</span></div>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSubtitle}>Sign in to your ITGEL account</p>
        </div>

        <div className={styles.authForm}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="userInput">Email or username</Label>
              <Input
                id="userInput"
                placeholder="you@example.com or username"
                autoComplete="username"
                {...register('userInput')}
              />
              {errors.userInput && <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.userInput.message}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="password">Password</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.password.message}</p>}
            </div>

            <Button type="submit" className={styles.fullWidth} disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className={styles.authFooter}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.authLink}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  )
}
