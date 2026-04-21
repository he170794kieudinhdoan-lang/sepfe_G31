import { useState, useEffect } from 'react'
import { getMyInvitations, respondToInvitation } from '../api/interviewInvitationApi'
import { useAuth } from '@/shared/contexts/AuthContext'

const getErrorMessage = (err, fallback) => {
  const message = err?.response?.data?.message || err?.message || fallback
  return Array.isArray(message) ? message.join(', ') : message
}

export const useWorkerInvitations = (page = 1, limit = 10) => {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page, limit, total: 0 })

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      setInvitations([])
      return
    }

    const fetchInvitations = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getMyInvitations(page, limit)
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

  const respond = async (invitationId, payload) => {
    try {
      const updatedInvitation = await respondToInvitation(invitationId, payload)
      setInvitations((current) =>
        current.map((invitation) =>
          invitation.id === invitationId
            ? { ...invitation, ...updatedInvitation }
            : invitation,
        ),
      )
      setError(null)

      try {
        const result = await getMyInvitations(page, limit)
        setInvitations(result.data)
        setPagination({
          page: result.page,
          limit: result.limit,
          total: result.total,
        })
      } catch (refreshErr) {
        console.warn('Failed to refresh invitations after respond:', refreshErr)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể cập nhật lời mời phỏng vấn'))
      throw err
    }
  }

  return { invitations, loading, error, pagination, respond }
}
