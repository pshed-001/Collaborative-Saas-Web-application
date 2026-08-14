import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import useThemeStore from '../stores/theme-store'

const REMOTE_IMAGES = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
]

const REMOTE_IMAGES_ENABLED = import.meta.env.VITE_ENABLE_REMOTE_IMAGES === 'true'

const FALLBACK_GRADIENT = {
  dark: 'linear-gradient(135deg, #031716 0%, #0a7075 100%)',
  light: 'linear-gradient(135deg, #e7f2f2 0%, #0a7075 100%)',
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

export default function SlideshowBackground({ className }) {
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState(0)
  const [images, setImages] = useState([])
  const indexRef = useRef(0)
  const intervalRef = useRef(null)
  const resolvedTheme = useThemeStore(s => s.resolvedTheme)

  useEffect(() => {
    let cancelled = false
    async function setup() {
      let available = []
      if (REMOTE_IMAGES_ENABLED) {
        const results = await Promise.all(REMOTE_IMAGES.map(preloadImage))
        available = REMOTE_IMAGES.filter((_, i) => results[i])
      }
      if (cancelled) return
      setImages(available)
    }
    setup()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (images.length < 2) return
    indexRef.current = 0
    intervalRef.current = setInterval(() => {
      const current = indexRef.current
      const next = (current + 1) % images.length
      indexRef.current = next
      setPrev(current)
      setIndex(next)
    }, 2000)
    return () => clearInterval(intervalRef.current)
  }, [images])

  const overlay = resolvedTheme === 'dark'
    ? 'linear-gradient(135deg, rgba(3,23,22,0.82) 0%, rgba(3,23,22,0.5) 40%, rgba(10,112,117,0.18) 100%)'
    : 'linear-gradient(135deg, rgba(3,23,22,0.7) 0%, rgba(3,23,22,0.45) 40%, rgba(10,112,117,0.15) 100%)'

  const hasImages = images.length > 0
  const currentSrc = hasImages ? images[index % images.length] : null

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
      {hasImages ? (
        <>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${currentSrc})`,
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
                backgroundImage: `url(${images[prev % images.length]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
        </>
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: FALLBACK_GRADIENT[resolvedTheme],
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
