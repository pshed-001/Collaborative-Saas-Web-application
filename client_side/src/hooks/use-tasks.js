import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiDelete, getErrorMessage } from '../lib/api'
import { toast } from './use-toast'

export function useTasks(workspaceId) {
  return useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: () => apiGet(`/workspace/${workspaceId}/tasks`),
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useTask(workspaceId, taskId) {
  return useQuery({
    queryKey: ['task', workspaceId, taskId],
    queryFn: () => apiGet(`/workspace/${workspaceId}/tasks/${taskId}`),
    enabled: !!workspaceId && !!taskId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateTask(workspaceId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => apiPost(`/workspace/${workspaceId}/tasks`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', workspaceId] })
      toast.success('Task created')
    },
    onError: (err) => {
      toast.error('Failed to create task', getErrorMessage(err))
    },
  })
}

export function useReassignTask(workspaceId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, assignedUserId }) =>
      apiPost(`/workspace/${workspaceId}/tasks/${taskId}/assign`, { assignedUserId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', workspaceId] })
      toast.success('Task reassigned')
    },
    onError: (err) => {
      toast.error('Failed to reassign task', getErrorMessage(err))
    },
  })
}

export function useUpdateTask(workspaceId, taskId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => apiPatch(`/workspace/${workspaceId}/tasks/${taskId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', workspaceId] })
      qc.invalidateQueries({ queryKey: ['task', workspaceId, taskId] })
      toast.success('Task updated')
    },
    onError: (err) => {
      toast.error('Failed to update task', getErrorMessage(err))
    },
  })
}

export function useDeleteTask(workspaceId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (taskId) => apiDelete(`/workspace/${workspaceId}/tasks/${taskId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', workspaceId] })
      qc.invalidateQueries({ queryKey: ['deletedTasks', workspaceId] })
      toast.success('Task moved to trash')
    },
    onError: (err) => {
      toast.error('Failed to delete task', getErrorMessage(err))
    },
  })
}

export function useRestoreTask(workspaceId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (taskId) => apiPatch(`/workspace/${workspaceId}/tasks/${taskId}/restore`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', workspaceId] })
      qc.invalidateQueries({ queryKey: ['deletedTasks', workspaceId] })
      toast.success('Task restored')
    },
    onError: (err) => {
      toast.error('Failed to restore task', getErrorMessage(err))
    },
  })
}

export function useDeletedTasks(workspaceId) {
  return useQuery({
    queryKey: ['deletedTasks', workspaceId],
    queryFn: () => apiGet(`/workspace/${workspaceId}/tasks/trash`),
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpdateTaskStatus(workspaceId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, status }) => apiPatch(`/workspace/${workspaceId}/tasks/${taskId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', workspaceId] })
      qc.invalidateQueries({ queryKey: ['task'] })
      toast.success('Status updated')
    },
    onError: (err) => {
      toast.error('Failed to update status', getErrorMessage(err))
    },
  })
}
