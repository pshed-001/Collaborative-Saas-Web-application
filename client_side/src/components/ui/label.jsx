import styles from './label.module.css'
import { cn } from '../../lib/utils'

export default function Label({ className, children, ...props }) {
  return (
    <label className={cn(styles.label, className)} {...props}>
      {children}
    </label>
  )
}
