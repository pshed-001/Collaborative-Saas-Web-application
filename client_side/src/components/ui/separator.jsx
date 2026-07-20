import styles from './separator.module.css'
import { cn } from '../../lib/utils'

export default function Separator({ className, orientation = 'horizontal', ...props }) {
  return (
    <div
      role="separator"
      className={cn(styles.separator, orientation === 'horizontal' ? styles.horizontal : styles.vertical, className)}
      {...props}
    />
  )
}
