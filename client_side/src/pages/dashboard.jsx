import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, FolderOpen } from 'lucide-react'
import AnimatedPage from '../components/animated-page'
import Button from '../components/ui/button'
import Badge from '../components/ui/badge'
import Skeleton from '../components/ui/skeleton'
import { Card, CardContent } from '../components/ui/card'
import { useMyWorkspaces } from '../hooks/use-workspaces'
import CreateWorkspaceModal from '../components/create-workspace-modal'
import { CATEGORIES } from '../lib/constants'
import { timeAgo, truncate } from '../lib/utils'

const list = { animate: { transition: { staggerChildren: 0.05 } } }
const item = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const [showCreate, setShowCreate] = useState(false)
  const [filterCategory, setFilterCategory] = useState([])
  const [search, setSearch] = useState('')
  const { data: workspaces, isLoading } = useMyWorkspaces(filterCategory.length ? filterCategory : undefined)

  const filtered = (workspaces || []).filter(
    (w) => !search || w.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AnimatedPage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <style>{`
          @media (max-width: 640px) {
            .dash-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
            .dash-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Header */}
        <div className="dash-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>My Workspaces</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Manage your collaborative workspaces</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Workspace
          </Button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input
            placeholder="Search workspaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', height: '40px', borderRadius: '10px', border: '1px solid var(--input-border)',
              backgroundColor: 'var(--input-bg)', paddingLeft: '36px', paddingRight: '12px',
              fontSize: '14px', color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.target.style.outline = 'none'; e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--ring)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CATEGORIES.slice(0, 12).map((cat) => {
            const selected = filterCategory.includes(cat.value)
            return (
              <button
                key={cat.value}
                onClick={() =>
                  setFilterCategory((prev) =>
                    prev.includes(cat.value) ? prev.filter((c) => c !== cat.value) : [...prev, cat.value]
                  )
                }
                style={{
                  borderRadius: '9999px', border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                  padding: '4px 12px', fontSize: '12px', fontWeight: 500,
                  backgroundColor: selected ? 'rgba(10,112,117,0.1)' : 'transparent',
                  color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.15s', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Workspace list */}
        {isLoading ? (
          <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Skeleton style={{ height: '20px', width: '75%' }} />
                  <Skeleton style={{ height: '16px', width: '100%' }} />
                  <Skeleton style={{ height: '16px', width: '50%' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Skeleton style={{ height: '20px', width: '64px', borderRadius: '9999px' }} />
                    <Skeleton style={{ height: '20px', width: '80px', borderRadius: '9999px' }} />
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <FolderOpen size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>No workspaces yet</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '300px', textAlign: 'center' }}>
              Create your first workspace or browse public ones to join.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create Workspace</Button>
              <Link to="/discover"><Button variant="outline">Discover</Button></Link>
            </div>
          </div>
        ) : (
          <motion.div
            variants={list}
            initial="initial"
            animate="animate"
            className="dash-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}
          >
            {filtered.map((ws, i) => (
              <motion.div key={ws.workspaceId || i} variants={item}>
                <Link to={`/workspace/${ws.workspaceId}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <Card style={{ transition: 'box-shadow 0.2s' }}>
                    <CardContent style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {ws.name}
                        </h3>
                        <Badge variant={ws.mode === 'PUBLIC' ? 'default' : 'secondary'}>
                          {ws.mode === 'PUBLIC' ? '🌍 Public' : '🔒 Private'}
                        </Badge>
                      </div>
                      {ws.description && (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          {truncate(ws.description, 80)}
                        </p>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {(ws.category || '').split(',').filter(Boolean).slice(0, 3).map((c, ci) => (
                          <Badge key={ci} variant="outline">{CATEGORIES.find((cat) => cat.value === c.trim())?.label || c.trim()}</Badge>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Created {timeAgo(ws.createdAt)}
                        </span>
                        {ws.role && (
                          <Badge variant={ws.role === 'ADMIN' ? 'default' : 'secondary'} style={{ fontSize: '10px' }}>
                            {ws.role}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <CreateWorkspaceModal open={showCreate} onClose={() => setShowCreate(false)} />
    </AnimatedPage>
  )
}
