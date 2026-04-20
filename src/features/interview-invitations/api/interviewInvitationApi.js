import { apiClient } from '@/shared/api/apiClient'

export const createCampaign = async (campaignData) => {
  return await apiClient.post('/interview-invitations/campaigns', campaignData)
}

export const getCampaigns = async (page = 1, limit = 10, status = null) => {
  const params = new URLSearchParams({ page, limit })
  if (status) params.append('status', status)

  return await apiClient.get(
    `/interview-invitations/campaigns?${params.toString()}`,
  )
}

export const getCampaignDetail = async (campaignId) => {
  return await apiClient.get(
    `/interview-invitations/campaigns/${campaignId}`,
  )
}

export const sendCampaign = async (campaignId) => {
  return await apiClient.put(
    `/interview-invitations/campaigns/${campaignId}/send`,
  )
}

export const cancelCampaign = async (campaignId) => {
  return await apiClient.put(
    `/interview-invitations/campaigns/${campaignId}/cancel`,
  )
}

export const getCampaignStats = async (campaignId) => {
  return await apiClient.get(
    `/interview-invitations/campaigns/${campaignId}/stats`,
  )
}

export const getJobInviteConstraints = async (jobId) => {
  return await apiClient.get(
    `/interview-invitations/jobs/${jobId}/invite-constraints`,
  )
}

export const getMyInvitations = async (page = 1, limit = 10) => {
  return await apiClient.get(
    `/interview-invitations/my-invitations?page=${page}&limit=${limit}`,
  )
}

export const respondToInvitation = async (invitationId, payload) => {
  return await apiClient.put(
    `/interview-invitations/invitations/${invitationId}/respond`,
    payload,
  )
}
