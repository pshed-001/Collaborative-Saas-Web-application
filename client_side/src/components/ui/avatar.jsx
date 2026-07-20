import styles from './avatar.module.css'
import { cn, getInitials } from '../../lib/utils'

export default function Avatar({ firstname, lastname, src, className, size = 'default' }) {
  const sizeClass = {
    sm: styles.sm,
    default: styles.default_size,
    lg: styles.lg,
    xl: styles.xl,
  }

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstname || ''} ${lastname || ''}`}
        className={cn(styles.avatar, styles.img, sizeClass[size], className)}
      />
    )
  }

  return (
    <div className={cn(styles.avatar, styles.initials, sizeClass[size], className)}>
      {getInitials(firstname, lastname)}
    </div>
  )
}
