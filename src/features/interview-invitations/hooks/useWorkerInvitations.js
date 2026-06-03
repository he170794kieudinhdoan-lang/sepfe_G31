import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyInvitations, respondToInvitation, getPendingInvitationsStatus } from '../api/interviewInvitationApi'
import { useAuth } from '@/shared/contexts/AuthContext'

export const useWorkerInvitations = (page = 1, limit = 10, type = null) => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['worker-invitations', page, limit, type],
    queryFn: () => getMyInvitations(page, limit, type),
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })
}

export const usePendingInvitationsStatus = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['pending-invitations-status'],
    queryFn: () => getPendingInvitationsStatus(),
    enabled: !!user?.id,
  })
}

export const useRespondToInvitationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invitationId, payload }) => respondToInvitation(invitationId, payload),
    onSuccess: () => {
      // Không await — tránh chặn UI trong lúc refetch toàn bộ danh sách
      void queryClient.invalidateQueries({ queryKey: ['worker-invitations'] })
      void queryClient.invalidateQueries({ queryKey: ['pending-invitations-status'] })
    },
  })
}
