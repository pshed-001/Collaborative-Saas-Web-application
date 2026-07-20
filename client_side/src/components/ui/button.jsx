import { forwardRef } from 'react'
import styles from './button.module.css'
import { cn } from '../../lib/utils'

const variantClass = {
  default: styles.default,
  secondary: styles.secondary,
  outline: styles.outline,
  ghost: styles.ghost,
  destructive: styles.destructive,
  link: styles.link,
}

const sizeClass = {
  default: styles.default_size,
  sm: styles.sm,
  lg: styles.lg,
  icon: styles.icon,
}

const Button = forwardRef(function Button(
  { className, variant = 'default', size = 'default', disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(styles.button, variantClass[variant], sizeClass[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
