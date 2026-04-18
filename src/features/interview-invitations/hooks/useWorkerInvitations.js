import { useState, useEffect } from 'react'
import { getMyInvitations, respondToInvitation } from '../api/interviewInvitationApi'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getAccessToken } from '@/shared/api/tokenService'

export const useWorkerInvitations = (page = 1, limit = 10) => {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page, limit, total: 0 })

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      setInvitations([])
      return
    }

    const fetchInvitations = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getMyInvitations(token, page, limit)
        setInvitations(result.data)
        setPagination({
          page: result.page,
          limit: result.limit,
          total: result.total,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [user?.id, page, limit])

  const respond = async (invitationId, status, responseMessage = null) => {
    const token = getAccessToken()
    if (!token) throw new Error('Chưa đăng nhập')
    try {
      await respondToInvitation(token, invitationId, status, responseMessage)
      const result = await getMyInvitations(token, page, limit)
      setInvitations(result.data)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return { invitations, loading, error, pagination, respond }
}
