import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiDelete, getErrorMessage } from '../lib/api'
import { toast } from './use-toast'

export function useMyWorkspaces(category) {
  return useQuery({
    queryKey: ['workspaces', 'me', category],
    queryFn: () => {
      const params = category?.length ? { category: category.join(',') } : undefined
      return apiGet('/workspace/me', params)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicWorkspaces(category) {
  return useQuery({
    queryKey: ['workspaces', 'public', category],
    queryFn: () => {
      const params = category?.length ? { category: category.join(',') } : undefined
      return apiGet('/workspace', params)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useWorkspaceDetail(id) {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => apiGet(`/workspace/${id}`),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  })
}

export function useTrashWorkspaces() {
  return useQuery({
    queryKey: ['workspaces', 'trash'],
    queryFn: () => apiGet('/workspace/trash'),
    staleTime: 60 * 1000,
  })
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => apiPost('/workspace', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Workspace created')
    },
    onError: (err) => {
      toast.error('Failed to create workspace', getErrorMessage(err))
    },
  })
}

export function useUpdateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => apiPatch(`/workspace/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['workspace', vars.id] })
      qc.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Workspace updated')
    },
    onError: (err) => {
      toast.error('Failed to update workspace', getErrorMessage(err))
    },
  })
}

export function useJoinWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiPost(`/workspace/${id}/join`),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: ['workspaces'] })
      qc.invalidateQueries({ queryKey: ['workspace', id] })
      qc.invalidateQueries({ queryKey: ['members', id] })
      toast.success(res.response?.data?.message || 'Joined')
    },
    onError: (err) => {
      toast.error('Could not join', getErrorMessage(err))
    },
  })
}

export function useLeaveWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiPatch(`/workspace/${id}/leave`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Left workspace')
    },
    onError: (err) => {
      toast.error('Could not leave', getErrorMessage(err))
    },
  })
}

export function useDeleteWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiDelete(`/workspace/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] })
      qc.invalidateQueries({ queryKey: ['workspaces', 'trash'] })
      toast.success('Workspace moved to trash')
    },
    onError: (err) => {
      toast.error('Failed to delete', getErrorMessage(err))
    },
  })
}

export function useRecoverWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiPatch(`/workspace/${id}/recover`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] })
      qc.invalidateQueries({ queryKey: ['workspaces', 'trash'] })
      toast.success('Workspace recovered')
    },
    onError: (err) => {
      toast.error('Failed to recover', getErrorMessage(err))
    },
  })
}

export function usePermanentDeleteWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiDelete(`/workspace/${id}/permanent-delete`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces', 'trash'] })
      toast.success('Workspace permanently deleted')
    },
    onError: (err) => {
      toast.error('Failed to delete permanently', getErrorMessage(err))
    },
  })
}
