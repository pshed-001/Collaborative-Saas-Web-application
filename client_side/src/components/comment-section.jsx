import { useState } from 'react'
import { MessageSquare, Reply, Trash2, Send, Pencil, Check, X } from 'lucide-react'
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from '../hooks/use-comments'
import useAuthStore from '../stores/auth-store'
import Avatar from './ui/avatar'
import { Card, CardContent } from './ui/card'
import { ConfirmDialog } from './ui/dialog'
import { timeAgo } from '../lib/utils'

function CommentItem({ comment, workspaceId, taskId, currentUserId, isAdmin, onDelete }) {
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const createComment = useCreateComment(workspaceId, taskId)
  const updateComment = useUpdateComment(workspaceId, taskId)

  const isAuthor = comment.author?.id === currentUserId
  const canDelete = isAuthor || isAdmin
  const canEdit = isAuthor

  function handleReply() {
    if (!replyContent.trim() || replyContent.trim().length < 3) return
    createComment.mutate(
      { content: replyContent.trim(), parentId: comment.id, repliedUserId: comment.author?.id },
      { onSuccess: () => { setReplyContent(''); setShowReply(false) } }
    )
  }

  function handleEdit() {
    if (!editContent.trim() || editContent.trim().length < 3) return
    updateComment.mutate(
      { commentId: comment.id, content: editContent.trim() },
      { onSuccess: () => setEditing(false) }
    )
  }

  return (
    <div style={{ paddingLeft: comment.depth > 0 ? 24 : 0, borderLeft: comment.depth > 0 ? '2px solid var(--border)' : 'none', marginLeft: comment.depth > 0 ? 12 : 0 }}>
      <div style={{ display: 'flex', gap: 10, padding: '12px 0' }}>
        <Avatar firstname={comment.author?.firstname || comment.author?.username} lastname={comment.author?.lastname} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{comment.author?.username}</span>
            {comment.repliedUser && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>replied to @{comment.repliedUser.username}</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{timeAgo(comment.createdAt)}</span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>(edited)</span>
            )}
          </div>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--accent)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleEdit}
                  disabled={updateComment.isPending || editContent.trim().length < 3}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, cursor: 'pointer', opacity: updateComment.isPending || editContent.trim().length < 3 ? 0.5 : 1 }}
                >
                  <Check size={12} /> Save
                </button>
                <button
                  onClick={() => { setEditing(false); setEditContent(comment.content) }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
          )}
          {!editing && (
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              {comment.depth === 0 && (
                <button onClick={() => setShowReply(!showReply)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Reply size={12} /> Reply
                </button>
              )}
              {canEdit && (
                <button onClick={() => setEditing(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Pencil size={12} /> Edit
                </button>
              )}
              {canDelete && (
                <button onClick={() => onDelete(comment.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          )}
          {showReply && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-end' }}>
              <textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder={`Reply to @${comment.author?.username}...`}
                rows={2}
                style={{ flex: 1, minWidth: 0, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }}
              />
              <button
                onClick={handleReply}
                disabled={createComment.isPending || replyContent.trim().length < 3}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', flexShrink: 0, opacity: createComment.isPending || replyContent.trim().length < 3 ? 0.5 : 1 }}
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentSection({ workspaceId, taskId, currentUserId, isAdmin }) {
  const [content, setContent] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { data: comments, isLoading } = useComments(workspaceId, taskId)
  const createComment = useCreateComment(workspaceId, taskId)
  const deleteComment = useDeleteComment(workspaceId, taskId)

  const topLevel = (comments || []).filter(c => !c.parentId)
  const replies = (comments || []).filter(c => c.parentId)
  const repliesByParent = replies.reduce((acc, r) => {
    ;(acc[r.parentId] = acc[r.parentId] || []).push(r)
    return acc
  }, {})

  function handleSubmit() {
    if (!content.trim() || content.trim().length < 3) return
    createComment.mutate({ content: content.trim() }, { onSuccess: () => setContent('') })
  }

  function renderComment(comment, depth = 0) {
    const children = repliesByParent[comment.id] || []
    return (
      <div key={comment.id}>
        <CommentItem
          comment={{ ...comment, depth }}
          workspaceId={workspaceId}
          taskId={taskId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDelete={(id) => setDeleteTarget(id)}
        />
        {children.map(child => renderComment(child, depth + 1))}
      </div>
    )
  }

  return (
    <Card>
      <CardContent style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Comments {comments?.length ? `(${comments.length})` : ''}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <Avatar firstname={useAuthStore.getState().user?.firstname} lastname={useAuthStore.getState().user?.lastname} size="sm" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSubmit}
                disabled={createComment.isPending || content.trim().length < 3}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: createComment.isPending || content.trim().length < 3 ? 0.5 : 1 }}
              >
                <Send size={13} /> {createComment.isPending ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>Loading comments...</div>
        ) : topLevel.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No comments yet. Be the first to comment.</div>
        ) : (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {topLevel.map(c => renderComment(c))}
          </div>
        )}

        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => { deleteComment.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) }) }}
          title="Delete Comment"
          description="Are you sure you want to delete this comment?"
          confirmLabel="Delete"
          loading={deleteComment.isPending}
        />
      </CardContent>
    </Card>
  )
}
