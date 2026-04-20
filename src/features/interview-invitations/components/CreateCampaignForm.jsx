import { useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useCampaignMutation } from '../hooks/useCampaignMutation'
import './CreateCampaignForm.css'

const CreateCampaignForm = ({ onSuccess, onCancel }) => {
  const now = Date.now()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    message: '',
    jobId: null,
    workerIds: [],
    slots: [
      {
        id: `slot-${now}`,
        startAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(now + 26 * 60 * 60 * 1000).toISOString(),
        capacity: 5,
        location: '',
        note: '',
      },
    ],
    expiresAt: '',
    scheduledAt: '',
  })

  const [selectedWorkers, setSelectedWorkers] = useState([])
  const [workerInput, setWorkerInput] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [error, setError] = useState(null)
  const { create, loading } = useCampaignMutation()

  const hasOverlap = (slots, candidate, ignoreSlotId = null) => {
    const candidateStart = new Date(candidate.startAt).getTime()
    const candidateEnd = new Date(candidate.endAt).getTime()

    return slots.some((slot) => {
      if (slot.id === ignoreSlotId) {
        return false
      }

      const slotStart = new Date(slot.startAt).getTime()
      const slotEnd = new Date(slot.endAt).getTime()
      return candidateStart < slotEnd && slotStart < candidateEnd
    })
  }

  const calendarEvents = useMemo(
    () =>
      formData.slots.map((slot) => ({
        id: slot.id,
        title: `Slot (${slot.capacity})`,
        start: slot.startAt,
        end: slot.endAt,
      })),
    [formData.slots],
  )

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

  const handleWorkerInputAdd = () => {
    const parsed = Number(workerInput)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError('Worker ID phải là số nguyên dương')
      return
    }

    setError(null)
    handleAddWorker(parsed)
    setWorkerInput('')
  }

  const handleCalendarSelect = (selectionInfo) => {
    const startAt = selectionInfo.start?.toISOString()
    const endAt = selectionInfo.end?.toISOString()
    if (!startAt || !endAt) {
      return
    }

    const id = `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const newSlot = {
      id,
      startAt,
      endAt,
      capacity: 5,
      location: '',
      note: '',
    }

    if (hasOverlap(formData.slots, newSlot)) {
      setError('Khung giờ mới bị trùng với slot hiện có')
      return
    }

    setError(null)
    setFormData((prev) => ({
      ...prev,
      slots: [
        ...prev.slots,
        newSlot,
      ],
    }))
    setSelectedSlotId(id)
  }

  const updateSlot = (slotId, partial) => {
    setFormData((prev) => ({
      ...prev,
      slots: prev.slots.map((slot) =>
        slot.id === slotId ? { ...slot, ...partial } : slot,
      ),
    }))
  }

  const handleEventDropOrResize = (changeInfo) => {
    const { event } = changeInfo
    if (!event.start || !event.end) {
      return
    }

    const updatedSlot = {
      id: event.id,
      startAt: event.start.toISOString(),
      endAt: event.end.toISOString(),
    }

    const startAtMs = new Date(updatedSlot.startAt).getTime()
    const endAtMs = new Date(updatedSlot.endAt).getTime()

    if (Number.isNaN(startAtMs) || Number.isNaN(endAtMs) || endAtMs <= startAtMs) {
      changeInfo.revert()
      setError('Không thể cập nhật slot: thời gian không hợp lệ')
      return
    }

    if (hasOverlap(formData.slots, updatedSlot, event.id)) {
      changeInfo.revert()
      setError('Không thể cập nhật slot: bị trùng với slot khác')
      return
    }

    setError(null)
    updateSlot(event.id, updatedSlot)
    setSelectedSlotId(event.id)
  }

  const handleDeleteSelectedSlot = () => {
    if (!selectedSlotId) {
      return
    }

    setFormData((prev) => {
      const nextSlots = prev.slots.filter((slot) => slot.id !== selectedSlotId)
      return {
        ...prev,
        slots: nextSlots,
      }
    })
    setSelectedSlotId(null)
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

    if (formData.slots.length === 0) {
      setError('Vui lòng tạo ít nhất 1 khung giờ trên lịch')
      return
    }

    const invalidSlot = formData.slots.find((slot) => {
      const startAt = new Date(slot.startAt)
      const endAt = new Date(slot.endAt)
      return Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt
    })

    if (invalidSlot) {
      setError('Có khung giờ không hợp lệ, vui lòng kiểm tra lại')
      return
    }

    try {
      const payload = {
        ...formData,
        slots: formData.slots.map(({ id, ...slot }) => slot),
      }
      const result = await create(payload)
      onSuccess?.(result)
    } catch (err) {
      setError(err.message)
    }
  }

  const selectedSlot = formData.slots.find((slot) => slot.id === selectedSlotId)

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
          <div className="worker-input-row">
            <input
              type="number"
              value={workerInput}
              onChange={(e) => setWorkerInput(e.target.value)}
              placeholder="Nhập worker ID"
              min="1"
            />
            <button type="button" onClick={handleWorkerInputAdd} className="add-worker-btn">
              Thêm
            </button>
          </div>
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

        <div className="form-group">
          <div className="calendar-header">
            <label>Lịch phỏng vấn (kéo chọn để tạo slot, kéo thả để đổi giờ)</label>
            <span>{formData.slots.length} slot</span>
          </div>
          <div className="calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              height={520}
              selectable
              editable
              selectMirror
              dayMaxEvents
              eventOverlap={false}
              selectOverlap={false}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              events={calendarEvents}
              select={handleCalendarSelect}
              eventDrop={handleEventDropOrResize}
              eventResize={handleEventDropOrResize}
              eventClick={(info) => setSelectedSlotId(info.event.id)}
            />
          </div>

          {selectedSlot && (
            <div className="slot-editor">
              <div className="slot-editor-title">Chỉnh sửa slot đã chọn</div>
              <div className="slot-editor-grid">
                <div className="form-group">
                  <label>Sức chứa</label>
                  <input
                    type="number"
                    min="1"
                    value={selectedSlot.capacity}
                    onChange={(e) =>
                      updateSlot(selectedSlot.id, {
                        capacity: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Địa điểm</label>
                  <input
                    type="text"
                    value={selectedSlot.location || ''}
                    onChange={(e) =>
                      updateSlot(selectedSlot.id, {
                        location: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  rows="3"
                  value={selectedSlot.note || ''}
                  onChange={(e) =>
                    updateSlot(selectedSlot.id, {
                      note: e.target.value,
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={handleDeleteSelectedSlot}
                className="delete-slot-btn"
              >
                Xóa slot này
              </button>
            </div>
          )}
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
