import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import styles from './dialog.module.css'
import { cn } from '../../lib/utils'

export function Dialog({ open, onClose, children }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [open, handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <div className={styles.overlay}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.backdrop}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className={styles.content}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function DialogHeader({ className, children, onClose, ...props }) {
  return (
    <div className={cn(styles.header, className)} {...props}>
      <div className={styles.headerRow}>
        <div>{children}</div>
        {onClose && (
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export function DialogTitle({ className, children, ...props }) {
  return (
    <h2 className={cn(styles.title, className)} {...props}>
      {children}
    </h2>
  )
}

export function DialogDescription({ className, children, ...props }) {
  return (
    <p className={cn(styles.description, className)} {...props}>
      {children}
    </p>
  )
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div className={cn(styles.footer, className)} {...props}>
      {children}
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', loading }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}><DialogTitle>{title}</DialogTitle></DialogHeader>
      {description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{description}</p>}
      <DialogFooter>
        <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--danger, #dc3545)', cursor: 'pointer', fontSize: 13, color: '#fff', opacity: loading ? 0.6 : 1 }}>{loading ? 'Deleting...' : confirmLabel}</button>
      </DialogFooter>
    </Dialog>
  )
}
