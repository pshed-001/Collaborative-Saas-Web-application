import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, RotateCcw, AlertTriangle, Clock } from 'lucide-react'
import { useTrashWorkspaces, useRecoverWorkspace, usePermanentDeleteWorkspace } from '../hooks/use-workspaces'
import { getErrorMessage } from '../lib/api'
import { toast } from '../hooks/use-toast'
import AnimatedPage from '../components/animated-page'
import Button from '../components/ui/button'
import Badge from '../components/ui/badge'
import Skeleton from '../components/ui/skeleton'
import { Card, CardContent } from '../components/ui/card'
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { countdown, timeAgo } from '../lib/utils'

function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetDate - Date.now()))
  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.max(0, targetDate - Date.now())
      setRemaining(r)
      if (r <= 0) clearInterval(interval)
    }, 60000)
    return () => clearInterval(interval)
  }, [targetDate])
  return remaining
}

function TrashItem({ workspace }) {
  const recover = useRecoverWorkspace()
  const permanentDelete = usePermanentDeleteWorkspace()
  const [showConfirm, setShowConfirm] = useState(false)
  const targetDate = new Date(workspace.deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000
  const remaining = useCountdown(targetDate)

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{workspace.name}</h3>
                {workspace.description && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{workspace.description}</p>}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Badge variant="outline" style={{ fontSize: '10px' }}><Clock size={12} /> Deleted {timeAgo(workspace.deletedAt)}</Badge>
                  {remaining > 0 ? (
                    <Badge variant="warning" style={{ fontSize: '10px' }}><AlertTriangle size={12} /> {countdown(remaining)}</Badge>
                  ) : (
                    <Badge variant="destructive" style={{ fontSize: '10px' }}>Expired</Badge>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {remaining > 0 && (
                  <Button size="sm" variant="outline" style={{ gap: '4px' }}
                    onClick={() => {
                      if (!workspace.id) return toast.error('Invalid workspace data')
                      recover.mutate(workspace.id, {
                        onError: (err) => toast.error('Failed to recover', getErrorMessage(err))
                      })
                    }} disabled={recover.isPending}>
                    <RotateCcw size={14} /> Recover
                  </Button>
                )}
                <Button size="sm" variant="destructive" style={{ gap: '4px' }}
                  onClick={() => setShowConfirm(true)}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogHeader onClose={() => setShowConfirm(false)}>
          <DialogTitle>Permanent Deletion</DialogTitle>
        </DialogHeader>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          This will <strong>permanently delete</strong> <strong>{workspace.name}</strong>. Cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => permanentDelete.mutate(workspace.id, { onSuccess: () => setShowConfirm(false) })} disabled={permanentDelete.isPending}>
            {permanentDelete.isPending ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

export default function Trash() {
  const { data, isLoading } = useTrashWorkspaces()
  const workspaces = Array.isArray(data) ? data : []

  return (
    <AnimatedPage>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 style={{ color: 'var(--error)' }} /> Trash
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Deleted workspaces are kept for 30 days before permanent deletion.
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton style={{ height: 96 }} />
          <Skeleton style={{ height: 96 }} />
        </div>
      ) : workspaces.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}>
          <Trash2 size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Trash is empty</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workspaces.map(ws => <TrashItem key={ws.id} workspace={ws} />)}
        </div>
      )}
    </AnimatedPage>
  )
}
