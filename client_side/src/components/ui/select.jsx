import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import styles from './select.module.css'
import { cn } from '../../lib/utils'

export default function Select({ value, onValueChange, children, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const items = []
  if (children) {
    const childArray = Array.isArray(children) ? children : [children]
    childArray.forEach((child) => {
      if (child?.type === SelectItem) {
        items.push(child.props)
      }
    })
  }

  const selected = items.find((i) => i.value === value)

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(styles.trigger, !selected && styles.placeholder)}
      >
        <span className="truncate">{selected?.children || placeholder || 'Select...'}</span>
        <ChevronDown className={cn(styles.chevron, open && styles.chevronOpen)} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className={styles.dropdown}
          >
            {items.map((item) => (
              <button
                key={item.value}
                type="button"
                className={cn(styles.option, value === item.value && styles.selected)}
                onClick={() => {
                  onValueChange?.(item.value)
                  setOpen(false)
                }}
              >
                <span className="flex-1 truncate">{item.children}</span>
                {value === item.value && <Check className={styles.check} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SelectItem() {
  return null
}
