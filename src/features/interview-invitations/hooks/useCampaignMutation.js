import { useState } from 'react'
import { createCampaign, sendCampaign, cancelCampaign } from '../api/interviewInvitationApi'

export const useCampaignMutation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async (campaignData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await createCampaign(campaignData)
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
      const result = await sendCampaign(campaignId)
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
      const result = await cancelCampaign(campaignId)
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
