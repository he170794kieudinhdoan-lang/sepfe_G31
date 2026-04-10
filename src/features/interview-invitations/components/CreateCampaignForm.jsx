import { useState } from 'react'
import { useCampaignMutation } from '../hooks/useCampaignMutation'
import './CreateCampaignForm.css'

const CreateCampaignForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    message: '',
    jobId: null,
    workerIds: [],
    expiresAt: '',
    scheduledAt: '',
  })

  const [selectedWorkers, setSelectedWorkers] = useState([])
  const [error, setError] = useState(null)
  const { create, loading } = useCampaignMutation()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddWorker = (workerId) => {
    if (!selectedWorkers.includes(workerId)) {
      setSelectedWorkers((prev) => [...prev, workerId])
      setFormData((prev) => ({
        ...prev,
        workerIds: [...prev.workerIds, workerId],
      }))
    }
  }

  const handleRemoveWorker = (workerId) => {
    setSelectedWorkers((prev) => prev.filter((id) => id !== workerId))
    setFormData((prev) => ({
      ...prev,
      workerIds: prev.workerIds.filter((id) => id !== workerId),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề chiến dịch')
      return
    }

    if (!formData.message.trim()) {
      setError('Vui lòng nhập nội dung tin nhắn')
      return
    }

    if (formData.workerIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 worker')
      return
    }

    try {
      const result = await create(formData)
      onSuccess?.(result)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="create-campaign-form">
      <h2>Tạo Chiến Dịch Mời Phỏng Vấn</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tiêu đề chiến dịch *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="vd: Mời phỏng vấn công nhân lắp ráp"
            required
          />
        </div>

        <div className="form-group">
          <label>Mô tả chiến dịch</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả ngắn về chiến dịch này"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Nội dung tin nhắn *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Nội dung tin nhắn sẽ được gửi đến worker"
            rows="5"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Thời gian hết hạn (tùy chọn)</label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Lên lịch gửi (tùy chọn)</label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Worker được chọn: {selectedWorkers.length}</label>
          <div className="selected-workers">
            {selectedWorkers.map((workerId) => (
              <span key={workerId} className="worker-badge">
                Worker {workerId}
                <button
                  type="button"
                  onClick={() => handleRemoveWorker(workerId)}
                  className="remove-btn"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Đang tạo...' : 'Tạo Chiến Dịch'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCampaignForm
