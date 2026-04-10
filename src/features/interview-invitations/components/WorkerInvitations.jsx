import { useState } from 'react'
import { useWorkerInvitations } from '../hooks/useWorkerInvitations'
import './WorkerInvitations.css'

const WorkerInvitations = () => {
  const [page, setPage] = useState(1)
  const { invitations, loading, error, pagination, respond } = useWorkerInvitations(page, 10)
  const [respondingId, setRespondingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)

  const handleAccept = async (invitationId) => {
    try {
      await respond(invitationId, 'ACCEPTED')
      setSuccessMessage('Bạn đã chấp nhận lời mời phỏng vấn!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error accepting invitation:', err)
    }
  }

  const handleReject = async (invitationId) => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      await respond(invitationId, 'REJECTED', rejectReason)
      setRejectReason('')
      setRespondingId(null)
      setSuccessMessage('Bạn đã từ chối lời mời phỏng vấn')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error rejecting invitation:', err)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: '#ff9800',
      ACCEPTED: '#4caf50',
      REJECTED: '#f44336',
      EXPIRED: '#999',
      CANCELLED: '#999',
    }
    const labels = {
      PENDING: 'Chờ phản hồi',
      ACCEPTED: 'Đã chấp nhận',
      REJECTED: 'Đã từ chối',
      EXPIRED: 'Đã hết hạn',
      CANCELLED: 'Đã hủy',
    }
    return { color: colors[status] || '#999', label: labels[status] || status }
  }

  if (loading) {
    return <div className="worker-invitations loading-state">Đang tải lời mời...</div>
  }

  return (
    <div className="worker-invitations">
      <h2>Lời Mời Phỏng Vấn</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {invitations.length === 0 ? (
        <div className="empty-state">
          <p>Bạn không có lời mời phỏng vấn nào</p>
        </div>
      ) : (
        <>
          <div className="invitations-list">
            {invitations.map((invitation) => {
              const statusBadge = getStatusBadge(invitation.status)
              const isExpired =
                invitation.campaign.expiresAt &&
                new Date(invitation.campaign.expiresAt) < new Date()

              return (
                <div key={invitation.id} className="invitation-card">
                  <div className="invitation-header">
                    <div className="company-info">
                      {invitation.company?.logoUrl && (
                        <img
                          src={invitation.company.logoUrl}
                          alt={invitation.company?.name}
                          className="company-logo"
                        />
                      )}
                      <div>
                        <h3>{invitation.campaign.title}</h3>
                        {invitation.company && (
                          <p className="company-name">{invitation.company.name}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusBadge.color }}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="invitation-message">
                    <h4>Nội dung tin nhắn:</h4>
                    <p>{invitation.campaign.message}</p>
                  </div>

                  {invitation.responseMessage && (
                    <div className="response-message">
                      <p>
                        <strong>Lý do từ chối:</strong> {invitation.responseMessage}
                      </p>
                    </div>
                  )}

                  <div className="invitation-footer">
                    <span className="date">
                      Nhận vào: {new Date(invitation.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {invitation.campaign.expiresAt && (
                      <span className="expiry-date">
                        Hết hạn:{' '}
                        {new Date(invitation.campaign.expiresAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  {invitation.status === 'PENDING' && !isExpired && (
                    <div className="invitation-actions">
                      <button
                        className="action-btn accept"
                        onClick={() => handleAccept(invitation.id)}
                      >
                        ✓ Chấp Nhận
                      </button>

                      {respondingId === invitation.id ? (
                        <div className="reject-form">
                          <textarea
                            placeholder="Nhập lý do từ chối..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows="3"
                          />
                          <div className="reject-buttons">
                            <button
                              className="action-btn confirm-reject"
                              onClick={() => handleReject(invitation.id)}
                            >
                              Xác Nhận Từ Chối
                            </button>
                            <button
                              className="action-btn cancel-reject"
                              onClick={() => {
                                setRespondingId(null)
                                setRejectReason('')
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="action-btn reject"
                          onClick={() => setRespondingId(invitation.id)}
                        >
                          ✕ Từ Chối
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {pagination.total > 10 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </button>
              <span>
                Trang {page} / {Math.ceil(pagination.total / 10)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(pagination.total / 10)}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WorkerInvitations
