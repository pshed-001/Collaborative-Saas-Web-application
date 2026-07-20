import styles from './badge.module.css'
import { cn } from '../../lib/utils'

const variantClass = {
  default: styles.default,
  secondary: styles.secondary,
  outline: styles.outline,
  destructive: styles.destructive,
  success: styles.success,
  warning: styles.warning,
}

export default function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span className={cn(styles.badge, variantClass[variant], className)} {...props}>
      {children}
    </span>
  )
}
