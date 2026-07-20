import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiDelete, getErrorMessage } from '../lib/api'
import { toast } from './use-toast'

export function useComments(workspaceId, taskId) {
  return useQuery({
    queryKey: ['comments', workspaceId, taskId],
    queryFn: () => apiGet(`/workspace/${workspaceId}/tasks/${taskId}/comments`),
    enabled: !!workspaceId && !!taskId,
    staleTime: 30 * 1000,
  })
}

export function useCreateComment(workspaceId, taskId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => apiPost(`/workspace/${workspaceId}/tasks/${taskId}/comments`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', workspaceId, taskId] })
      toast.success('Comment added')
    },
    onError: (err) => {
      toast.error('Failed to add comment', getErrorMessage(err))
    },
  })
}

export function useUpdateComment(workspaceId, taskId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, content }) =>
      apiPatch(`/workspace/${workspaceId}/tasks/${taskId}/comments/${commentId}`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', workspaceId, taskId] })
      toast.success('Comment updated')
    },
    onError: (err) => {
      toast.error('Failed to update comment', getErrorMessage(err))
    },
  })
}

export function useDeleteComment(workspaceId, taskId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId) =>
      apiDelete(`/workspace/${workspaceId}/tasks/${taskId}/comments/${commentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', workspaceId, taskId] })
      toast.success('Comment deleted')
    },
    onError: (err) => {
      toast.error('Failed to delete comment', getErrorMessage(err))
    },
  })
}
