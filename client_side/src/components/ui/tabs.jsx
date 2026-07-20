import { useState, createContext, useContext } from 'react'
import styles from './tabs.module.css'
import { cn } from '../../lib/utils'

const TabsContext = createContext()

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue)
  const active = controlledValue !== undefined ? controlledValue : internal
  const setActive = onValueChange || setInternal

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn(styles.tabs, className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children, ...props }) {
  return (
    <div className={cn(styles.list, className)} {...props}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, className, children, ...props }) {
  const { active, setActive } = useContext(TabsContext)
  return (
    <button
      className={cn(styles.trigger, active === value && styles.triggerActive, className)}
      onClick={() => setActive(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children, ...props }) {
  const { active } = useContext(TabsContext)
  if (active !== value) return null
  return (
    <div className={cn(styles.content, className)} {...props}>
      {children}
    </div>
  )
}
