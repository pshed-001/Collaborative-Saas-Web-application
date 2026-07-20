import { useEffect } from 'react'
import useThemeStore from '../stores/theme-store'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function ThemeToggle({ className }) {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    useThemeStore.getState().initTheme()
  }, [])

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '8px',
        backgroundColor: 'var(--muted)',
        padding: '4px',
      }}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            padding: '6px',
            transition: 'all 0.15s ease',
            backgroundColor: theme === value ? 'var(--surface)' : 'transparent',
            color: theme === value ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: theme === value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          title={label}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  )
}
