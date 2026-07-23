import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Clock, User, CalendarDays, Flag, ShieldCheck, Pencil, Trash2, UserPlus } from 'lucide-react'
import { toast } from '../hooks/use-toast'
import AnimatedPage from '../components/animated-page'
import Button from '../components/ui/button'
import Badge from '../components/ui/badge'
import Skeleton from '../components/ui/skeleton'
import Avatar from '../components/ui/avatar'
import Input from '../components/ui/input'
import Textarea from '../components/ui/textarea'
import Label from '../components/ui/label'
import Select, { SelectItem } from '../components/ui/select'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, ConfirmDialog } from '../components/ui/dialog'
import { Card, CardContent } from '../components/ui/card'
import CommentSection from '../components/comment-section'
import { useTask, useUpdateTask, useDeleteTask, useReassignTask, useUpdateTaskStatus } from '../hooks/use-tasks'
import { useWorkspaceDetail } from '../hooks/use-workspaces'
import { useMembers } from '../hooks/use-members'
import useAuthStore from '../stores/auth-store'
import { timeAgo } from '../lib/utils'

const STATUS_VARIANT = {
  TODO: 'secondary',
  IN_PROGRESS: 'default',
  IN_REVIEW: 'warning',
  REVIEWED: 'outline',
  CANCELLED: 'destructive',
  COMPLETED: 'success',
}

const STATUS_LABEL = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  REVIEWED: 'Reviewed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

const PRIORITY_VARIANT = {
  LOW: 'secondary',
  NORMAL: 'default',
  HIGH: 'destructive',
}

const PRIORITY_LABEL = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
}

export default function TaskDetail() {
  const { id, taskId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { data: workspace, isLoading: wsLoading } = useWorkspaceDetail(id)
  const { data: members } = useMembers(id)
  const { data: task, isLoading, error } = useTask(id, taskId)
  const deleteTask = useDeleteTask(id)
  const reassign = useReassignTask(id)
  const updateStatus = useUpdateTaskStatus(id)
  const [showEdit, setShowEdit] = useState(false)
  const [showReassign, setShowReassign] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  if (isLoading || wsLoading) {
    return <AnimatedPage>
      <Skeleton style={{ width: 160, height: 20 }} />
      <Skeleton style={{ width: '60%', height: 28, marginTop: 16 }} />
      <Skeleton style={{ height: 160, borderRadius: 12, marginTop: 24 }} />
    </AnimatedPage>
  }

  if (error || !task) {
    return <AnimatedPage style={{ textAlign: 'center', padding: '80px 0' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Task not found</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{error?.message || 'This task may have been deleted.'}</p>
      <Link to={`/workspace/${id}`}><Button variant="outline" style={{ marginTop: 16 }}>Back to Workspace</Button></Link>
    </AnimatedPage>
  }

  const assignee = (members || []).find(m => m.userId === task.assignedToId)
  const creator = task.createdBy
  const isOwner = workspace?.ownerId === user?.id
  const mship = (members || []).find(m => m.userId === user?.id)
  const isAdmin = isOwner || mship?.role === 'ADMIN'
  const isCreator = creator?.id === user?.id
  const canEdit = isOwner || isAdmin || isCreator
  const canAssign = isOwner || isAdmin || isCreator
  const canReassign = canAssign && task.status !== 'COMPLETED' && task.status !== 'CANCELLED'
  const isAssignee = task.assignedToId === user?.id
  const isManager = isOwner || isAdmin || isCreator
  const allowedStatuses = isManager
    ? ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'REVIEWED', 'COMPLETED', 'CANCELLED']
    : isAssignee
      ? ['IN_PROGRESS', 'COMPLETED']
      : []
  const statusMeta = {
    TODO:        { label: 'To Do',      color: 'var(--text-secondary)', desc: 'Not started yet' },
    IN_PROGRESS: { label: 'In Progress', color: 'var(--accent)',         desc: 'Currently working on it' },
    IN_REVIEW:   { label: 'In Review',   color: 'var(--warning)',        desc: 'Pending review' },
    REVIEWED:    { label: 'Reviewed',    color: 'var(--text-primary)',   desc: 'Review complete' },
    COMPLETED:   { label: 'Completed',   color: 'var(--success)',        desc: 'Done' },
    CANCELLED:   { label: 'Cancelled',   color: 'var(--error)',          desc: 'Stopped' },
  }
  const activeMembers = (members || []).filter(m => m.status === 'ACTIVE')

  return (
    <AnimatedPage>
      <style>{`
        @media (max-width: 700px) {
          .task-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .task-header-row {
            gap: 6px !important;
          }
          .task-header-row h1 {
            font-size: 18px !important;
            width: 100%;
          }
        }
      `}</style>
      <button
        onClick={() => navigate(`/workspace/${id}`)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16,
          cursor: 'pointer', color: 'var(--text-secondary)', background: 'none',
          border: 'none', fontSize: 14, padding: 0, maxWidth: '100%',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
      >
        <ArrowLeft size={16} /> Back to {workspace?.name || 'Workspace'}
      </button>

      <div style={{ marginBottom: 24 }}>
        <div className="task-header-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginRight: 4 }}>{task.title}</h1>
          <Badge variant={STATUS_VARIANT[task.status] || 'secondary'}>{STATUS_LABEL[task.status] || task.status}</Badge>
          <Badge variant={PRIORITY_VARIANT[task.priority] || 'secondary'}>{PRIORITY_LABEL[task.priority] || task.priority}</Badge>
          {canEdit && (
            <button onClick={() => setShowEdit(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
              <Pencil size={12} /> Edit
            </button>
          )}
          {canEdit && (
            <button onClick={() => setShowDelete(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12, color: 'var(--error, #dc3545)' }} disabled={deleteTask.isPending}>
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 24, alignItems: 'start' }} className="task-detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardContent style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h3>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{task.description}</p>
            </CardContent>
          </Card>
          <CommentSection workspaceId={id} taskId={taskId} currentUserId={user?.id} isAdmin={isAdmin} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {allowedStatuses.length > 0 && (
            <Card>
              <CardContent style={{ padding: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Status</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  {isManager
                    ? 'You can update the status of this task.'
                    : 'As the assignee, you can mark this task as in progress or completed.'}
                </p>
                <Select value={task.status} onValueChange={(val) => updateStatus.mutate({ taskId, status: val })}>
                  {allowedStatuses.map(s => (
                    <SelectItem key={s} value={s}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusMeta[s].color, flexShrink: 0, display: 'inline-block' }} />
                        {statusMeta[s].label}
                      </span>
                    </SelectItem>
                  ))}
                </Select>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
                  Currently: <strong style={{ color: statusMeta[task.status]?.color }}>{statusMeta[task.status]?.label}</strong> — {statusMeta[task.status]?.desc}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(10,112,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Due Date</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(10,112,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flag size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Priority</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{PRIORITY_LABEL[task.priority] || task.priority}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(10,112,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarDays size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Created</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{timeAgo(task.createdAt)}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(10,112,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Created By</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{creator?.username || 'Unknown'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(10,112,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Assigned To</p>
                    {assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Avatar firstname={assignee.user?.firstname} lastname={assignee.user?.lastname} size="sm" />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{assignee.user?.firstname} {assignee.user?.lastname}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{assignee.user?.username}</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Unassigned</p>
                    )}
                  </div>
                </div>
                {canAssign && (
                  <button onClick={() => {
                    if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
                      toast.error(`Cannot reassign: task is ${task.status === 'COMPLETED' ? 'completed' : 'cancelled'}`)
                      return
                    }
                    setShowReassign(true)
                  }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: task.status === 'COMPLETED' || task.status === 'CANCELLED' ? 'not-allowed' : 'pointer', fontSize: 12, color: 'var(--accent)', flexShrink: 0, opacity: task.status === 'COMPLETED' || task.status === 'CANCELLED' ? 0.5 : 1 }}>
                    <UserPlus size={12} /> Reassign
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <UpdateTask
        open={showEdit}
        onClose={() => setShowEdit(false)}
        task={task}
        workspaceId={id}
        taskId={taskId}
      />

      <ReassignTask
        open={showReassign}
        onClose={() => setShowReassign(false)}
        task={task}
        members={activeMembers}
        reassign={reassign}
      />

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteTask.mutate(taskId, { onSuccess: () => { setShowDelete(false); navigate(`/workspace/${id}`) } })}
        title="Delete Task"
        description="Are you sure you want to move this task to trash?"
        confirmLabel="Delete"
        loading={deleteTask.isPending}
      />
    </AnimatedPage>
  )
}

function UpdateTask({ open, onClose, task, workspaceId, taskId }) {
  const update = useUpdateTask(workspaceId, taskId)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [priority, setPriority] = useState(task.priority)

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    if (description.trim().length < 3 || description.trim().length > 500) return
    const changes = {}
    if (title.trim() !== task.title) changes.title = title.trim()
    if (description.trim() !== task.description) changes.description = description.trim()
    if (priority !== task.priority) changes.priority = priority
    if (Object.keys(changes).length === 0) return
    update.mutate(changes, { onSuccess: onClose })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Task title" /></div>
        <div><Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} placeholder="Details (3-500 chars)" />
          <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{description.length}/500</p>
        </div>
        <div><Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={update.isPending || !title.trim() || description.trim().length < 3}>{update.isPending ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

function ReassignTask({ open, onClose, task, members, reassign }) {
  const [userId, setUserId] = useState('')
  if (!task) return null
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader><DialogTitle>Reassign Task</DialogTitle></DialogHeader>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}><strong>{task.title}</strong></p>
      <Label>Assign to</Label>
      <Select value={userId} onValueChange={setUserId} placeholder="Select a member">
        {members.map(m => <SelectItem key={m.userId} value={m.userId}>{m.user?.firstname} {m.user?.lastname}</SelectItem>)}
      </Select>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { reassign.mutate({ taskId: task.id, assignedUserId: userId }, { onSuccess: onClose }) }}
          disabled={reassign.isPending || !userId || userId === task.assignedToId}>
          {reassign.isPending ? 'Reassigning...' : 'Reassign'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
