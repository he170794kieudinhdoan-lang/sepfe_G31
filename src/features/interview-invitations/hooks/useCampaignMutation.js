import { useState } from 'react'
import { createCampaign, getCampaigns, sendCampaign, cancelCampaign } from '../api/interviewInvitationApi'
import { useAuth } from '@/shared/hooks/useAuth'

export const useCampaignMutation = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async (campaignData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await createCampaign(token, campaignData)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const send = async (campaignId) => {
    setLoading(true)
    setError(null)
    try {
      const result = await sendCampaign(token, campaignId)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const cancel = async (campaignId) => {
    setLoading(true)
    setError(null)
    try {
      const result = await cancelCampaign(token, campaignId)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, send, cancel, loading, error }
}
