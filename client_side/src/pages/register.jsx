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

const schema = z
  .object({
    firstname: z.string().min(1, 'First name is required'),
    lastname: z.string().min(1, 'Last name is required'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(10, 'Password must be at least 10 characters'),
    confirmPassword: z.string().min(10, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function Register() {
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
      await apiPost('/auth/register', data)
      const { payload: loginPayload, token: loginToken } = await apiPost('/auth/login', {
        userInput: data.username,
        password: data.password,
      })
      if (loginToken) {
        setAuth(loginPayload, loginToken)
        if (loginPayload?.id) {
          localStorage.setItem(`seen:${loginPayload.id}`, '1')
        }
        navigate('/dashboard')
      } else {
        toast.success('Account created', 'Please sign in.')
        navigate('/login')
      }
    } catch (err) {
      toast.error('Registration failed', getErrorMessage(err))
    }
  }

  return (
    <div className={styles.authPage}>
      <SlideshowBackground />
      <div className={styles.themeCorner}><ThemeToggle /></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoMark}><span>I</span></div>
          <h1 className={styles.authTitle}>Create your account</h1>
          <p className={styles.authSubtitle}>Join ITGEL and start collaborating</p>
        </div>

        <div className={styles.authForm}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Label htmlFor="firstname">First name</Label>
                <Input id="firstname" placeholder="John" {...register('firstname')} />
                {errors.firstname && <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.firstname.message}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Label htmlFor="lastname">Last name</Label>
                <Input id="lastname" placeholder="Doe" {...register('lastname')} />
                {errors.lastname && <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.lastname.message}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="johndoe" {...register('username')} />
              {errors.username && <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.username.message}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
              {errors.email && <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.email.message}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="password">Password</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 10 characters"
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat your password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className={styles.fullWidth} disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className={styles.authFooter}>
          Already have an account?{' '}
          <Link to="/login" className={styles.authLink}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
