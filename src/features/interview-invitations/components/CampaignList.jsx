import { useEffect, useState } from 'react'
import { getCampaigns, getCampaignDetail, sendCampaign } from '../api/interviewInvitationApi'
import { useAuth } from '@/shared/hooks/useAuth'
import './CampaignList.css'

const CampaignList = () => {
  const { token } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!token) return

    const fetchCampaigns = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getCampaigns(token, page, 10, selectedStatus)
        setCampaigns(result.data)
        setTotal(result.total)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [token, page, selectedStatus])

  const handleSendCampaign = async (campaignId) => {
    try {
      await sendCampaign(token, campaignId)
      // Refresh campaigns
      const result = await getCampaigns(token, page, 10, selectedStatus)
      setCampaigns(result.data)
    } catch (err) {
      setError(err.message)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: '#999',
      SCHEDULED: '#ff9800',
      IN_PROGRESS: '#2196f3',
      COMPLETED: '#4caf50',
      CANCELLED: '#f44336',
    }
    return colors[status] || '#999'
  }

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="campaign-list">
      <h2>Các Chiến Dịch Mời Phỏng Vấn</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <button
          className={`filter-btn ${selectedStatus === null ? 'active' : ''}`}
          onClick={() => {
            setSelectedStatus(null)
            setPage(1)
          }}
        >
          Tất cả
        </button>
        {['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            className={`filter-btn ${selectedStatus === status ? 'active' : ''}`}
            onClick={() => {
              setSelectedStatus(status)
              setPage(1)
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state">Không có chiến dịch nào</div>
      ) : (
        <>
          <div className="campaigns-grid">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-header">
                  <h3>{campaign.title}</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(campaign.status) }}
                  >
                    {campaign.status}
                  </span>
                </div>

                {campaign.description && (
                  <p className="campaign-description">{campaign.description}</p>
                )}

                <div className="campaign-stats">
                  <div className="stat">
                    <span className="label">Tổng cộng:</span>
                    <span className="value">{campaign.totalCount}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Chấp nhận:</span>
                    <span className="value accept">{campaign.acceptedCount}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Từ chối:</span>
                    <span className="value reject">{campaign.rejectedCount}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Chờ phản hồi:</span>
                    <span className="value pending">{campaign.pendingCount}</span>
                  </div>
                </div>

                <div className="campaign-dates">
                  {campaign.createdAt && (
                    <p className="date">
                      Tạo: {new Date(campaign.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                  {campaign.expiresAt && (
                    <p className="date">
                      Hết hạn: {new Date(campaign.expiresAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>

                <div className="campaign-actions">
                  {campaign.status === 'DRAFT' && (
                    <button
                      className="action-btn send"
                      onClick={() => handleSendCampaign(campaign.id)}
                    >
                      Gửi Ngay
                    </button>
                  )}
                  <button className="action-btn view">Xem Chi Tiết</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Trang trước
            </button>
            <span>
              Trang {page} / {Math.ceil(total / 10)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 10)}
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default CampaignList
