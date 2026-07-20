import styles from './skeleton.module.css'
import { cn } from '../../lib/utils'

export default function Skeleton({ className, ...props }) {
  return <div className={cn(styles.skeleton, className)} {...props} />
}
