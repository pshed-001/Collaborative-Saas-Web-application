import { forwardRef } from 'react'
import styles from './textarea.module.css'
import { cn } from '../../lib/utils'

const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      className={cn(styles.textarea, className)}
      ref={ref}
      {...props}
    />
  )
})

export default Textarea
