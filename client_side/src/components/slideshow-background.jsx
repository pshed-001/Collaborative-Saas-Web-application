import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import useThemeStore from '../stores/theme-store'

const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
]

export default function SlideshowBackground({ className }) {
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState(0)
  const intervalRef = useRef(null)
  const resolvedTheme = useThemeStore(s => s.resolvedTheme)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPrev(index)
      setIndex(i => (i + 1) % SLIDE_IMAGES.length)
    }, 2000)
    return () => clearInterval(intervalRef.current)
  }, [index])

  const overlay = resolvedTheme === 'dark'
    ? 'linear-gradient(135deg, rgba(3,23,22,0.82) 0%, rgba(3,23,22,0.5) 40%, rgba(10,112,117,0.18) 100%)'
    : 'linear-gradient(135deg, rgba(3,23,22,0.7) 0%, rgba(3,23,22,0.45) 40%, rgba(10,112,117,0.15) 100%)'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
      className={className}
    >
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${SLIDE_IMAGES[index]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {prev !== index && (
        <motion.div
          key={'prev-' + prev}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${SLIDE_IMAGES[prev]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlay,
        }}
      />
    </div>
  )
}
