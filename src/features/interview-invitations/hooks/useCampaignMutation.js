import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCampaign, sendCampaign, resendCampaign, cancelCampaign, updateCampaign } from '../api/interviewInvitationApi'

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-interview-campaigns'] })
    },
  })
}

export const useSendCampaignMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-interview-campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] })
    },
  })
}

export const useResendCampaignMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resendCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-interview-campaigns'] })
    },
  })
}

export const useCancelCampaignMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-interview-campaigns'] })
    },
  })
}

export const useUpdateCampaignMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ campaignId, data }) => updateCampaign(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-interview-campaigns'] })
    },
  })
}

