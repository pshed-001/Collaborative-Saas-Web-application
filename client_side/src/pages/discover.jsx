import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Globe, UserPlus } from 'lucide-react'
import AnimatedPage from '../components/animated-page'
import Button from '../components/ui/button'
import Badge from '../components/ui/badge'
import { Card, CardContent } from '../components/ui/card'
import Skeleton from '../components/ui/skeleton'
import { usePublicWorkspaces, useJoinWorkspace } from '../hooks/use-workspaces'
import { CATEGORIES } from '../lib/constants'
import { timeAgo, truncate } from '../lib/utils'
import useAuthStore from '../stores/auth-store'

const list = { animate: { transition: { staggerChildren: 0.05 } } }
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

export default function Discover() {
  const [filterCategory, setFilterCategory] = useState([])
  const [search, setSearch] = useState('')
  const { data: workspaces, isLoading } = usePublicWorkspaces(filterCategory.length ? filterCategory : undefined)
  const join = useJoinWorkspace()
  const user = useAuthStore((s) => s.user)

  const filtered = (workspaces || []).filter(
    (w) => !search || w.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AnimatedPage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Globe size={24} style={{ color: "var(--accent)" }}/> Discover Workspaces
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>Browse and join public workspaces</p>
        </div>

        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-secondary)" }}/>
          <input
            placeholder="Search workspaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", height: "40px", borderRadius: "10px", border: "1px solid var(--input-border)",
              backgroundColor: "var(--input-bg)", paddingLeft: "36px", paddingRight: "12px",
              fontSize: "14px", color: "var(--text-primary)",
            }}
            onFocus={(e) => { e.target.style.outline = "none"; e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--ring)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--input-border)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {CATEGORIES.slice(0, 12).map((cat) => {
            const selected = filterCategory.includes(cat.value)
            return (
              <button
                key={cat.value}
                onClick={() => setFilterCategory((prev) =>
                  prev.includes(cat.value) ? prev.filter((c) => c !== cat.value) : [...prev, cat.value]
                )}
                style={{
                  borderRadius: "9999px", border: selected ? "1px solid var(--accent)" : "1px solid var(--border)",
                  padding: "4px 12px", fontSize: "12px", fontWeight: 500,
                  backgroundColor: selected ? "rgba(10,112,117,0.1)" : "transparent",
                  color: selected ? "var(--accent)" : "var(--text-secondary)",
                  transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap"
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--surface)", padding: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <Skeleton style={{ height: "20px", width: "75%" }} />
                  <Skeleton style={{ height: "16px", width: "100%" }} />
                  <Skeleton style={{ height: "16px", width: "50%" }} />
                  <Skeleton style={{ height: "36px", width: "96px", borderRadius: "8px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" }}>
            <Globe size={48} style={{ color: "var(--text-secondary)", marginBottom: "16px" }}/>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>No public workspaces found</h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px" }}>Try a different search or category.</p>
          </div>
        ) : (
          <motion.div
            variants={list}
            initial="initial"
            animate="animate"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}
          >
            {filtered.map((ws, i) => {
              const isOwner = ws.ownerId === user?.id
              const hasAccess = ws.role || ws.accessLevel

              return (
                <motion.div key={ws.workspaceId || i} variants={item}>
                  <Link to={`/workspace/${ws.workspaceId || ws.id}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer", transition: "box-shadow 0.15s, border-color 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(10,112,117,0.15)" }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}>
                      <div style={{ padding: "20px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>{ws.name}</h3>
                        {ws.description && <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" }}>{truncate(ws.description, 80)}</p>}
                        <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                          {(ws.category || "").split(",").filter(Boolean).slice(0, 3).map((c, ci) => (
                            <Badge key={ci} variant="outline">{CATEGORIES.find((cat) => cat.value === c.trim())?.label || c.trim()}</Badge>
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Created {timeAgo(ws.createdAt)}</span>
                          {isOwner ? <Badge variant="default">Owner</Badge> :
                           hasAccess ? <Badge variant="secondary">{ws.role || "Member"}</Badge> :
                           <Button size="sm" variant="outline" style={{ height: "32px" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); join.mutate(ws.workspaceId) }} disabled={join.isPending}><UserPlus size={14} /> Join</Button>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  )
}
