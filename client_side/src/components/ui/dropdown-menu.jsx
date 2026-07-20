import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './dropdown-menu.module.css'
import { cn } from '../../lib/utils'

const DropdownContext = createContext()

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className={styles.wrapper}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownTrigger({ children }) {
  const { setOpen, open } = useContext(DropdownContext)
  return (
    <div onClick={() => setOpen(!open)} className={styles.trigger}>
      {children}
    </div>
  )
}

export function DropdownContent({ className, children, align = 'end' }) {
  const { open } = useContext(DropdownContext)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.1 }}
          className={cn(styles.menu, align === 'end' ? styles.end : styles.start, className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function DropdownItem({ className, children, onClick, disabled, ...props }) {
  const { setOpen } = useContext(DropdownContext)
  return (
    <button
      className={cn(styles.item, className)}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onClick?.()
          setOpen(false)
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className={styles.separator} />
}
