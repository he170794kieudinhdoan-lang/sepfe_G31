import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyInvitations, respondToInvitation } from '../api/interviewInvitationApi'
import { useAuth } from '@/shared/contexts/AuthContext'

export const useWorkerInvitations = (page = 1, limit = 10, type = null) => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['worker-invitations', page, limit, type],
    queryFn: () => getMyInvitations(page, limit, type),
    enabled: !!user?.id,
  })
}

export const useRespondToInvitationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invitationId, payload }) => respondToInvitation(invitationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-invitations'] })
    },
  })
}
