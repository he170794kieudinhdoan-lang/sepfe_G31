const BASE_API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const createCampaign = async (token, campaignData) => {
  const response = await fetch(`${BASE_API_URL}/interview-invitations/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(campaignData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create campaign')
  }

  return response.json()
}

export const getCampaigns = async (token, page = 1, limit = 10, status = null) => {
  const params = new URLSearchParams({ page, limit })
  if (status) params.append('status', status)

  const response = await fetch(
    `${BASE_API_URL}/interview-invitations/campaigns?${params}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch campaigns')
  }

  return response.json()
}

export const getCampaignDetail = async (token, campaignId) => {
  const response = await fetch(
    `${BASE_API_URL}/interview-invitations/campaigns/${campaignId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch campaign detail')
  }

  return response.json()
}

export const sendCampaign = async (token, campaignId) => {
  const response = await fetch(
    `${BASE_API_URL}/interview-invitations/campaigns/${campaignId}/send`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to send campaign')
  }

  return response.json()
}

export const cancelCampaign = async (token, campaignId) => {
  const response = await fetch(
    `${BASE_API_URL}/interview-invitations/campaigns/${campaignId}/cancel`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to cancel campaign')
  }

  return response.json()
}

export const getCampaignStats = async (token, campaignId) => {
  const response = await fetch(
    `${BASE_API_URL}/interview-invitations/campaigns/${campaignId}/stats`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch campaign stats')
  }

  return response.json()
}

export const getMyInvitations = async (token, page = 1, limit = 10) => {
  const response = await fetch(
    `${BASE_API_URL}/interview-invitations/my-invitations?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch invitations')
  }

  return response.json()
}

export const respondToInvitation = async (token, invitationId, status, responseMessage = null) => {
  const response = await fetch(
    `${BASE_API_URL}/interview-invitations/invitations/${invitationId}/respond`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        responseMessage,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to respond to invitation')
  }

  return response.json()
}
