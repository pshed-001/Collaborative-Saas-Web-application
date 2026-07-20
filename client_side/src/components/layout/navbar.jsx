import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Compass, Trash2, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../stores/auth-store'
import { apiPost } from '../../lib/api'
import ThemeToggle from '../theme-toggle'
import Avatar from '../ui/avatar'
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '../ui/dropdown-menu'
import styles from './navbar.module.css'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/trash', label: 'Trash', icon: Trash2 },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    try {
      await apiPost('/auth/logout')
    } catch {} // eslint-disable-line no-empty
    logout()
    navigate('/login')
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/dashboard" className={styles.logo}>
            <div className={styles.logoMark}>
              <span>I</span>
            </div>
            <span className={styles.logoText}>ITGEL</span>
          </Link>
          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={styles.navLink}>
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownTrigger>
              <Avatar firstname={user?.firstname} lastname={user?.lastname} size="sm" />
            </DropdownTrigger>
            <DropdownContent align="end" className={styles.dropdown}>
              <div style={{ padding: '8px 12px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {user?.firstname} {user?.lastname}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>@{user?.username}</p>
              </div>
              <DropdownSeparator />
              <DropdownItem onClick={() => navigate('/profile')}>
                <User size={16} /> Profile
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                <LogOut size={16} /> Log out
              </DropdownItem>
            </DropdownContent>
          </DropdownMenu>

          <button
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={styles.mobileMenu}
          >
            <div className={styles.mobileLinks}>
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
