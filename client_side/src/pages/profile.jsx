import { useNavigate } from 'react-router-dom'
import { User, Mail, AtSign, Calendar, LogOut } from 'lucide-react'
import AnimatedPage from '../components/animated-page'
import Button from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import Separator from '../components/ui/separator'
import Avatar from '../components/ui/avatar'
import ThemeToggle from '../components/theme-toggle'
import useAuthStore from '../stores/auth-store'
import { apiPost } from '../lib/api'
import { timeAgo } from '../lib/utils'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '8px', backgroundColor: 'var(--surface-subtle)', padding: '12px' }}>
      <Icon size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await apiPost('/auth/logout') } catch {} // eslint-disable-line no-empty
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <AnimatedPage>
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Profile & Settings</h1>

        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar firstname={user.firstname} lastname={user.lastname} size="xl" />
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.firstname} {user.lastname}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>@{user.username}</p>
              </div>
            </div>
            <Separator />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <InfoRow icon={User} label="Full Name" value={`${user.firstname} ${user.lastname}`} />
              <InfoRow icon={AtSign} label="Username" value={`@${user.username}`} />
              <InfoRow icon={Mail} label="Email" value={user.email || 'Not shown'} />
              {user.createdAt && <InfoRow icon={Calendar} label="Joined" value={timeAgo(user.createdAt)} />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Theme</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Light, dark, or system</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle style={{ color: 'var(--error)' }}>Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Sign Out</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sign out on this device</p>
              </div>
              <Button variant="destructive" onClick={handleLogout} style={{ gap: '8px' }}>
                <LogOut size={16} /> Log out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
