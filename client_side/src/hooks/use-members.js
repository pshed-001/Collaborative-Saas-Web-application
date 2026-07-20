import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch, getErrorMessage } from '../lib/api'
import { toast } from './use-toast'

export function useMembers(workspaceId) {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => apiGet(`/workspace/${workspaceId}/members`),
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useApproveMember(workspaceId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) => apiPatch(`/workspace/${workspaceId}/members/${userId}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', workspaceId] })
      toast.success('Member approved')
    },
    onError: (err) => toast.error('Failed to approve', getErrorMessage(err)),
  })
}

export function useRejectMember(workspaceId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) => apiPatch(`/workspace/${workspaceId}/members/${userId}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', workspaceId] })
      toast.success('Member rejected')
    },
    onError: (err) => toast.error('Failed to reject', getErrorMessage(err)),
  })
}

export function useRemoveMember(workspaceId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) => apiPatch(`/workspace/${workspaceId}/members/${userId}/remove-user`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', workspaceId] })
      toast.success('Member removed')
    },
    onError: (err) => toast.error('Failed to remove member', getErrorMessage(err)),
  })
}

export function useUpdateMemberRole(workspaceId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }) =>
      apiPatch(`/workspace/${workspaceId}/members/${userId}/update-user`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', workspaceId] })
      toast.success('Role updated')
    },
    onError: (err) => toast.error('Failed to update role', getErrorMessage(err)),
  })
}
