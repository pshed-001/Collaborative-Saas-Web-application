import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Users, Layout, Shield, Zap } from 'lucide-react'
import Button from '../components/ui/button'
import ThemeToggle from '../components/theme-toggle'
import SlideshowBackground from '../components/slideshow-background'
import styles from './landing.module.css'

const features = [
  { icon: Layout, title: 'Workspaces', desc: 'Create public or private workspaces for your projects.' },
  { icon: Users, title: 'Collaborate', desc: 'Invite members, assign roles, and work together.' },
  { icon: Shield, title: 'Role-based Access', desc: 'Admin and member roles with fine-grained permissions.' },
  { icon: Zap, title: 'Task Management', desc: 'Create, assign, and track tasks with priorities and deadlines.' },
]

export default function Landing() {
  const gridRef = useRef(null)
  const gridInView = useInView(gridRef, { once: true, amount: 0.15 })

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <div className={styles.logoMark}><span>I</span></div>
            <span className={styles.logoText}>ITGEL</span>
          </div>
          <div className={styles.navActions}>
            <ThemeToggle />
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/register"><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <SlideshowBackground />
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={styles.heroInner}
          >
            <h1 className={styles.heroTitle}>
              Collaborate. <span className={styles.heroAccent}>Organize.</span> Ship.
            </h1>
            <p className={styles.heroSubtitle}>
              ITGEL is a collaborative workspace platform that helps teams manage projects, tasks, and members in one place.
            </p>
            <div className={styles.heroCtas}>
              <Link to="/register">
                <Button size="lg">Start for free <ArrowRight size={16} /></Button>
              </Link>
              <Link to="/discover">
                <Button variant="outline" size="lg">Browse Workspaces</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.featuresInner}>
          <h2 className={styles.featuresTitle}>Everything you need to collaborate</h2>
          <div className={styles.featuresGrid} ref={gridRef}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40, scale: 0.92 }}
                animate={gridInView ? { opacity: 1, y: 0, scale: 1.05 } : {}}
                whileHover={{ scale: 1.05 }}
                transition={{ delay: 0.15 * i, duration: 0.7, ease: 'easeOut' }}
                className={styles.featureCard}
              >
                <div className={styles.featureIcon}>
                  <f.icon size={20} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          &copy; 2026 ITGEL. Built for collaborative teams.
        </div>
      </footer>
    </div>
  )
}
