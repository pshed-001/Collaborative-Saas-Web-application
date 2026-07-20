import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Users, ListTodo, Info, Trash2, UserMinus, UserPlus, User,
  Check, X, MoreVertical, Pencil, Clock, ShieldCheck
} from 'lucide-react'
import AnimatedPage from '../components/animated-page'
import Button from '../components/ui/button'
import Badge from '../components/ui/badge'
import Skeleton from '../components/ui/skeleton'
import { Card, CardContent } from '../components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import Input from '../components/ui/input'
import Textarea from '../components/ui/textarea'
import Label from '../components/ui/label'
import Avatar from '../components/ui/avatar'
import Select, { SelectItem } from '../components/ui/select'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, ConfirmDialog } from '../components/ui/dialog'
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '../components/ui/dropdown-menu'
import { useWorkspaceDetail, useLeaveWorkspace, useJoinWorkspace, useDeleteWorkspace, useUpdateWorkspace } from '../hooks/use-workspaces'
import { useMembers, useApproveMember, useRejectMember, useRemoveMember, useUpdateMemberRole } from '../hooks/use-members'
import { useTasks, useCreateTask, useReassignTask, useDeleteTask, useDeletedTasks, useRestoreTask, useUpdateTaskStatus } from '../hooks/use-tasks'
import useAuthStore from '../stores/auth-store'
import { CATEGORIES, TASK_STATUSES, TASK_PRIORITIES, MEMBERSHIP_ROLES } from '../lib/constants'
import { timeAgo, truncate } from '../lib/utils'
import { toast } from '../hooks/use-toast'

function WorkspaceActions({ workspace, isOwner, isMember, navigate, onEdit }) {
  const leave = useLeaveWorkspace()
  const join = useJoinWorkspace()
  const deleteWs = useDeleteWorkspace()
  const [showDelete, setShowDelete] = useState(false)
  const wsId = workspace.workspaceId || workspace.id

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {isOwner && (
          <Button variant="outline" size="sm" style={{ gap: '6px', height: '32px' }}
            onClick={onEdit}
          ><Pencil size={16} /> Edit</Button>
        )}
        {!isOwner && isMember && (
          <Button variant="outline" size="sm" style={{ gap: '6px', height: '32px' }}
            onClick={() => leave.mutate(wsId, { onSuccess: () => navigate('/dashboard') })} disabled={leave.isPending}
          ><UserMinus size={16} /> Leave</Button>
        )}
        {!isOwner && !isMember && (
          <Button size="sm" style={{ gap: '6px', height: '32px' }}
            onClick={() => join.mutate(wsId)} disabled={join.isPending}
          ><UserPlus size={16} /> {join.isPending ? 'Joining...' : 'Join'}</Button>
        )}
        {isOwner && (
          <Button variant="destructive" size="sm" style={{ gap: '6px' }}
            onClick={() => setShowDelete(true)}
          ><Trash2 size={16} /> Delete</Button>
        )}
      </div>
      <Dialog open={showDelete} onClose={() => setShowDelete(false)}>
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
        </DialogHeader>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Move <strong>{workspace.name}</strong> to trash? It can be recovered within 30 days.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteWs.mutate(wsId, { onSuccess: () => { setShowDelete(false); navigate('/dashboard') } }) }} disabled={deleteWs.isPending}>
            {deleteWs.isPending ? 'Moving...' : 'Move to Trash'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

function EditWorkspace({ open, onClose, workspace }) {
  const update = useUpdateWorkspace()
  const [name, setName] = useState(workspace?.name || '')
  const [description, setDescription] = useState(workspace?.description || '')
  const [selectedCategories, setSelectedCategories] = useState(
    (workspace?.category || '').split(',').map(c => c.trim()).filter(Boolean)
  )

  const [categoryError, setCategoryError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    if (selectedCategories.length === 0) {
      setCategoryError('Select at least one category')
      return
    }
    setCategoryError('')
    update.mutate({
      id: workspace.workspaceId || workspace.id,
      name: name.trim(),
      description: description.trim(),
      category: selectedCategories,
    }, { onSuccess: onClose })
  }

  function toggleCategory(value) {
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    )
  }

  return (
      <Dialog open={open} onClose={() => { setCategoryError(''); onClose() }}>
      <DialogHeader><DialogTitle>Edit Workspace</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
        <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
        <div>
          <Label>Categories</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {CATEGORIES.map(cat => {
              const sel = selectedCategories.includes(cat.value)
              return (
                <button key={cat.value} type="button" onClick={() => { toggleCategory(cat.value); setCategoryError('') }}
                  style={{
                    borderRadius: 9999, border: sel ? '1px solid var(--accent)' : '1px solid var(--border)',
                    padding: '4px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                    backgroundColor: sel ? 'rgba(10,112,117,0.1)' : 'transparent',
                    color: sel ? 'var(--accent)' : 'var(--text-secondary)',
                  }}>{cat.label}</button>
              )
            })}
          </div>
          {categoryError && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 6 }}>{categoryError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={update.isPending || !name.trim() || selectedCategories.length === 0}>{update.isPending ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

function InviteLink({ workspaceId, mode }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/workspace/${workspaceId}`

  function handleCopy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      toast.success('Invite link copied')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card>
      <CardContent style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Share Invite Link</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {mode === 'PRIVATE' ? 'Anyone with this link can request access' : 'Anyone with this link can view and join'}
            </p>
          </div>
          <Button size="sm" variant="outline" style={{ flexShrink: 0, gap: 6 }} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Overview({ workspace }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
      <Card><CardContent style={{ padding: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Created</p>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{new Date(workspace.createdAt).toLocaleDateString()}</p>
      </CardContent></Card>
      <Card><CardContent style={{ padding: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mode</p>
        <p style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>{workspace.mode}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Cannot be changed</p>
      </CardContent></Card>
      <Card><CardContent style={{ padding: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Last updated</p>
        <p style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>{workspace.updatedAt ? timeAgo(workspace.updatedAt) : 'Never'}</p>
      </CardContent></Card>
    </div>
  )
}

function MembersSection({ workspaceId, data, loading, isAdmin, currentUserId, ownerId }) {
  const approve = useApproveMember(workspaceId)
  const reject = useRejectMember(workspaceId)
  const remove = useRemoveMember(workspaceId)
  const update = useUpdateMemberRole(workspaceId)
  const [editTarget, setEditTarget] = useState(null)

  if (loading) return <div style={{ marginTop: 16 }}><Skeleton style={{ height: 200, borderRadius: 12 }} /></div>

  const pending = (data || []).filter(m => m.status === 'PENDING')
  const active = (data || []).filter(m => m.status === 'ACTIVE')

  return (
    <div style={{ marginTop: 16 }}>
      {isAdmin && pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
            Pending Requests <Badge variant="warning">{pending.length}</Badge>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending.map(m => (
              <div key={m.id || m.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar firstname={m.user?.firstname} lastname={m.user?.lastname} size="sm" />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{m.user?.firstname} {m.user?.lastname}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{m.user?.username}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" onClick={() => approve.mutate(m.userId)} disabled={approve.isPending} style={{ height: 32 }}><Check size={14} style={{ marginRight: 4 }} />Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => reject.mutate(m.userId)} disabled={reject.isPending} style={{ height: 32 }}><X size={14} style={{ marginRight: 4 }} />Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Active ({active.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {active.map(m => {
          const isTargetOwner = m.userId === ownerId
          const isSelf = m.userId === currentUserId
          const canRemove = isAdmin && !isTargetOwner && !isSelf
          const canChangeRole = currentUserId === ownerId && !isTargetOwner && !isSelf
          return (
            <div key={m.id || m.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar firstname={m.user?.firstname} lastname={m.user?.lastname} size="sm" />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{m.user?.firstname} {m.user?.lastname}{isSelf && <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>(you)</span>}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{m.user?.username}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge variant={m.role === 'ADMIN' ? 'default' : 'secondary'}>{m.role || 'Member'}</Badge>
                {isAdmin && !isSelf && (
                  <DropdownMenu>
                    <DropdownTrigger>
                      <button style={{ padding: 6, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><MoreVertical size={16} /></button>
                    </DropdownTrigger>
                    <DropdownContent align="end">
                      {canChangeRole && <DropdownItem onClick={() => setEditTarget(m)}><Pencil size={14} />Change Role</DropdownItem>}
                      {canRemove && <DropdownItem onClick={() => remove.mutate(m.userId)}><UserMinus size={14} />Remove</DropdownItem>}
                    </DropdownContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)}>
        <DialogHeader>
          <DialogTitle>{editTarget?.role === 'ADMIN' ? 'Demote to Member' : 'Elevate to Admin'}</DialogTitle>
        </DialogHeader>
        {editTarget && (
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {editTarget.role === 'ADMIN'
                ? <>Remove admin privileges for <strong>{editTarget.user?.firstname} {editTarget.user?.lastname}</strong>?</>
                : <>Grant admin privileges to <strong>{editTarget.user?.firstname} {editTarget.user?.lastname}</strong>?</>}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {MEMBERSHIP_ROLES.map(r => {
                if (r.value === editTarget.role) return null
                return (
                  <button key={r.value} onClick={() => update.mutate({ userId: editTarget.userId, role: r.value }, { onSuccess: () => setEditTarget(null) })}
                    style={{
                      flex: 1, borderRadius: 8, padding: 12, cursor: 'pointer', textAlign: 'center',
                      border: r.value === 'ADMIN' ? '2px solid var(--accent)' : '2px solid var(--border)',
                      backgroundColor: r.value === 'ADMIN' ? 'rgba(10,112,117,0.05)' : 'transparent',
                      color: 'var(--text-primary)', fontWeight: 500,
                    }}>{r.label}</button>
                )
              })}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

function TasksSection({ workspaceId, data, loading, members, isOwner, isAdmin, currentUserId }) {
  const createTask = useCreateTask(workspaceId)
  const reassign = useReassignTask(workspaceId)
  const deleteTask = useDeleteTask(workspaceId)
  const updateStatus = useUpdateTaskStatus(workspaceId)
  const [showCreate, setShowCreate] = useState(false)
  const [reassignTarget, setReassignTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const activeMembers = (members || []).filter(m => m.status === 'ACTIVE')

  if (loading) return <div><Skeleton style={{ height: 200, borderRadius: 12 }} /></div>

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Tasks ({(data || []).length})</h3>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ New Task</Button>
      </div>

      {(!data || data.length === 0) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0' }}>
          <ListTodo size={40} style={{ color: 'var(--text-secondary)' }} />
          <p style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 12 }}>No tasks yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Create your first task</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map(task => (
            <TaskCard key={task.id} task={task} workspaceId={workspaceId} activeMembers={activeMembers} onReassign={setReassignTarget} onDelete={(id) => setDeleteTarget(id)} onStatusChange={(taskId, status) => updateStatus.mutate({ taskId, status })} isOwner={isOwner} isAdmin={isAdmin} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      <CreateTask open={showCreate} onClose={() => setShowCreate(false)} members={activeMembers} createTask={createTask} />
      <ReassignTask open={!!reassignTarget} onClose={() => setReassignTarget(null)} task={reassignTarget} members={activeMembers} reassign={reassign} />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { deleteTask.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) }) }} title="Delete Task" description="Are you sure you want to move this task to trash?" confirmLabel="Delete" loading={deleteTask.isPending} />
    </div>
  )
}

function TaskCard({ task, workspaceId, activeMembers, onReassign, onDelete, onStatusChange, isOwner, isAdmin, currentUserId }) {
  const navigate = useNavigate()
  const assignee = activeMembers.find(m => m.userId === task.assignedTo)
  const isCreator = task.createdBy?.id === currentUserId
  const isAssignee = task.assignedTo === currentUserId
  const canManage = isOwner || isAdmin || isCreator
  const isManager = isOwner || isAdmin || isCreator
  const allowedStatuses = isManager
    ? ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'REVIEWED', 'COMPLETED', 'CANCELLED']
    : isAssignee
      ? ['IN_PROGRESS', 'COMPLETED']
      : []
  const statusMeta = {
    TODO:              { label: 'To Do',           color: 'var(--text-secondary)', desc: 'Not started yet' },
    IN_PROGRESS:       { label: 'In Progress',     color: 'var(--accent)',         desc: 'Currently working on it' },
    IN_REVIEW:         { label: 'In Review',       color: 'var(--warning)',        desc: 'Pending review' },
    REVIEWED:          { label: 'Reviewed',         color: 'var(--text-primary)',   desc: 'Review complete' },
    COMPLETED:         { label: 'Completed',        color: 'var(--success)',        desc: 'Done' },
    CANCELLED:         { label: 'Cancelled',        color: 'var(--error)',          desc: 'Stopped' },
  }
  const currentMeta = statusMeta[task.status] || { label: task.status, color: 'var(--text-secondary)' }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/workspace/${workspaceId}/tasks/${task.id}`)}
      style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</p>
            <Badge style={{ fontSize: 10 }} variant={task.status === 'TODO' ? 'secondary' : task.status === 'IN_PROGRESS' ? 'default' : task.status === 'IN_REVIEW' ? 'warning' : task.status === 'REVIEWED' ? 'outline' : task.status === 'COMPLETED' ? 'success' : 'destructive'}>{currentMeta.label}</Badge>
            <Badge style={{ fontSize: 10 }}>{task.priority}</Badge>
          </div>
          {task.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{truncate(task.description, 100)}</p>}
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            {task.createdBy && <span><User size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />by {task.createdBy.username}</span>}
            {task.dueDate && <span><Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Due {new Date(task.dueDate).toLocaleDateString()}</span>}
            <span>{timeAgo(task.createdAt)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {assignee ? <Avatar firstname={assignee.user?.firstname} lastname={assignee.user?.lastname} size="sm" key={assignee.id} /> : <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Unassigned</span>}
          {(canManage || allowedStatuses.length > 0) && (
            <DropdownMenu>
              <DropdownTrigger>
                <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><MoreVertical size={16} /></button>
              </DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem onClick={() => {
                  if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
                    toast.error(`Cannot reassign: task is ${task.status === 'COMPLETED' ? 'completed' : 'cancelled'}`)
                    return
                  }
                  onReassign(task)
                }} style={{ opacity: task.status === 'COMPLETED' || task.status === 'CANCELLED' ? 0.5 : 1, cursor: task.status === 'COMPLETED' || task.status === 'CANCELLED' ? 'not-allowed' : 'pointer' }}><UserPlus size={14} />Assign</DropdownItem>
                {allowedStatuses.filter(s => s !== task.status).length > 0 && <DropdownSeparator />}
                {allowedStatuses.filter(s => s !== task.status).map(s => (
                  <DropdownItem key={s} onClick={() => onStatusChange?.(task.id, s)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusMeta[s].color, flexShrink: 0 }} />
                      <span>Set to: <strong>{statusMeta[s].label}</strong></span>
                    </span>
                  </DropdownItem>
                ))}
                <DropdownSeparator />
                <DropdownItem onClick={() => onDelete?.(task.id)} style={{ color: 'var(--error)' }}><Trash2 size={14} />Delete</DropdownItem>
              </DropdownContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CreateTask({ open, onClose, members, createTask }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('NORMAL')
  const [assignedTo, setAssignedTo] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title || !description || !dueDate || !assignedTo) return
    if (description.length < 3 || description.length > 500) return
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (new Date(dueDate) < today) return
    createTask.mutate({ title, description, dueDate: new Date(dueDate).toISOString(), priority, assignedTo }, {
      onSuccess() { setTitle(''), setDescription(''), setDueDate(''), setAssignedTo(''), onClose() }
    })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="What needs to be done?" /></div>
        <div><Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} placeholder="Details (3-500 chars)" />
          <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{description.length}/500</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><Label>Due</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required /></div>
          <div><Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </Select>
          </div>
        </div>
        <div><Label>Assign to</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo} placeholder="Select a member">
            {members.map(m => <SelectItem key={m.userId} value={m.userId}>{m.user?.firstname} {m.user?.lastname}</SelectItem>)}
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createTask.isPending || !assignedTo || description.length < 3}>{createTask.isPending ? 'Creating...' : 'Create'}</Button>
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
      <DialogHeader><DialogTitle>Reassign</DialogTitle></DialogHeader>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}><strong>{task.title}</strong></p>
      <Select value={userId} onValueChange={setUserId} placeholder="Select a member">
        {members.map(m => <SelectItem key={m.userId} value={m.userId}>{m.user?.firstname} {m.user?.lastname}</SelectItem>)}
      </Select>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { reassign.mutate({ taskId: task.id, assignedUserId: userId }, { onSuccess: onClose }) }}
          disabled={reassign.isPending || !userId || userId === task.assignedTo}>
          {reassign.isPending ? 'Reassigning...' : 'Reassign'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

function TrashSection({ workspaceId, data, loading, isOwner, isAdmin, currentUserId }) {
  const restoreTask = useRestoreTask(workspaceId)

  if (loading) return <div><Skeleton style={{ height: 200, borderRadius: 12 }} /></div>

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Deleted Tasks ({(data || []).length})</h3>
      </div>

      {(!data || data.length === 0) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0' }}>
          <Trash2 size={40} style={{ color: 'var(--text-secondary)' }} />
          <p style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 12 }}>No deleted tasks</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Deleted tasks will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map(task => {
            const isCreator = task.createdById === currentUserId
            const canRestore = isOwner || isAdmin || isCreator
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', opacity: 0.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'line-through' }}>{task.title}</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      {task.createdBy && <span>by {task.createdBy.username}</span>}
                      <span>Deleted {timeAgo(task.updatedAt || task.createdAt)}</span>
                    </div>
                  </div>
                  {canRestore && (
                    <Button size="sm" variant="outline" onClick={() => restoreTask.mutate(task.id)} disabled={restoreTask.isPending}>
                      <Check size={14} /> Restore
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function WorkspaceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { data: workspace, isLoading } = useWorkspaceDetail(id)
  const { data: members, isLoading: memLoading } = useMembers(id)
  const { data: tasks, isLoading: tasksLoading } = useTasks(id)
  const { data: deletedTasks, isLoading: trashLoading } = useDeletedTasks(id)
  const [showEdit, setShowEdit] = useState(false)

  if (isLoading) {
    return <AnimatedPage>
      <Skeleton style={{ width: 200, height: 20 }} />
      <Skeleton style={{ width: 400, height: 16, marginTop: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
        <Skeleton style={{ height: 120, borderRadius: 12 }} />
        <Skeleton style={{ height: 120, borderRadius: 12 }} />
        <Skeleton style={{ height: 120, borderRadius: 12 }} />
      </div>
    </AnimatedPage>
  }

  if (!workspace) {
    return <AnimatedPage style={{ textAlign: 'center', padding: '80px 0' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Workspace not found</h2>
      <Link to="/dashboard"><Button variant="outline" style={{ marginTop: 16 }}>Back</Button></Link>
    </AnimatedPage>
  }

  const isOwner = workspace.ownerId === user?.id
  const mship = (members || []).find(m => m.userId === user?.id)
  const isAdmin = isOwner || mship?.role === 'ADMIN'
  const cats = (workspace.category || '').split(',').filter(Boolean)

  return (
    <AnimatedPage>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, cursor: 'pointer', color: 'var(--text-secondary)', background: 'none', border: 'none', fontSize: 14, padding: 0 }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{workspace.name}</h1>
            <Badge variant={workspace.mode === 'PUBLIC' ? 'default' : 'secondary'}>{workspace.mode === 'PUBLIC' ? 'Public' : 'Private'}</Badge>
            {isAdmin && <Badge variant="outline"><ShieldCheck size={12} />Admin</Badge>}
          </div>
          {workspace.description && <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{workspace.description}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{cats.map(c => <Badge key={c} variant="outline">{c.trim()}</Badge>)}</div>
        </div>
        <WorkspaceActions workspace={workspace} isOwner={isOwner} isMember={!!mship} navigate={navigate} onEdit={() => setShowEdit(true)} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><Info size={14} /> Overview</TabsTrigger>
          <TabsTrigger value="members"><Users size={14} /> Members</TabsTrigger>
          <TabsTrigger value="tasks"><ListTodo size={14} /> Tasks</TabsTrigger>
          <TabsTrigger value="trash"><Trash2 size={14} /> Trash</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Overview workspace={workspace} />
          <div style={{ marginTop: 16 }}>
            <InviteLink workspaceId={id} mode={workspace.mode} />
          </div>
        </TabsContent>
        <TabsContent value="members">
          <MembersSection workspaceId={id} data={members} loading={memLoading} isAdmin={isAdmin} currentUserId={user?.id} ownerId={workspace.ownerId} />
        </TabsContent>
        <TabsContent value="tasks">
          <TasksSection workspaceId={id} data={tasks} loading={tasksLoading} members={members} isOwner={isOwner} isAdmin={isAdmin} currentUserId={user?.id} />
        </TabsContent>
        <TabsContent value="trash">
          <TrashSection workspaceId={id} data={deletedTasks} loading={trashLoading} isOwner={isOwner} isAdmin={isAdmin} currentUserId={user?.id} />
        </TabsContent>
      </Tabs>

      {isOwner && (
        <EditWorkspace open={showEdit} onClose={() => setShowEdit(false)} workspace={workspace} />
      )}
    </AnimatedPage>
  )
}
