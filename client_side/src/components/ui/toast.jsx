import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import styles from './toast.module.css'
import { cn } from '../../lib/utils'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  default: Info,
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className={styles.container}>
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const Icon = icons[t.variant] || icons.default
          const variantClass = styles[t.variant] || styles.default
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(styles.toast, variantClass)}
            >
              <div className={styles.row}>
                <Icon className={styles.icon} />
                <div className={styles.body}>
                  <p className={styles.title}>{t.title}</p>
                  {t.description && (
                    <p className={styles.description}>{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className={styles.dismiss}
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
