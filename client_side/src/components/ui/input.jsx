import { forwardRef } from 'react'
import styles from './input.module.css'
import { cn } from '../../lib/utils'

const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      type={type}
      className={cn(styles.input, className)}
      ref={ref}
      {...props}
    />
  )
})

export default Input
