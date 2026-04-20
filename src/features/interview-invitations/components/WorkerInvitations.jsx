import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useWorkerInvitations } from '../hooks/useWorkerInvitations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/shared/components/EmptyState'

const PAGE_SIZE = 10

const STATUS_META = {
  PENDING: {
    label: 'Chờ phản hồi',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ACCEPTED: {
    label: 'Đã chấp nhận',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REJECTED: {
    label: 'Đã từ chối',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  EXPIRED: {
    label: 'Đã hết hạn',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
}

const formatDateTime = (value) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const WorkerInvitations = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const { invitations, loading, error, pagination, respond } = useWorkerInvitations(
    page,
    PAGE_SIZE,
  )
  const [respondingId, setRespondingId] = useState(null)
  const [selectedSlotByInvitation, setSelectedSlotByInvitation] = useState({})
  const [rejectReasonByInvitation, setRejectReasonByInvitation] = useState({})

  const invitationIdFromUrl = searchParams.get('invitationId')
  useEffect(() => {
    if (!invitationIdFromUrl || loading) return
    const el = document.getElementById(`invitation-${invitationIdFromUrl}`)
    if (el) {
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      )
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('invitationId')
        return next
      },
      { replace: true },
    )
  }, [invitationIdFromUrl, loading, setSearchParams])
  const [successMessage, setSuccessMessage] = useState(null)

  const selectedInvitation = useMemo(
    () => invitations.find((item) => item.id === respondingId) || null,
    [invitations, respondingId],
  )

  const selectedRejectReason = selectedInvitation
    ? rejectReasonByInvitation[selectedInvitation.id] || ''
    : ''

  const handleAccept = async (invitationId) => {
    const slotId = Number(selectedSlotByInvitation[invitationId])
    if (!slotId) {
      alert('Vui lòng chọn ca phỏng vấn trước khi chấp nhận lời mời')
      return
    }

    try {
      await respond(invitationId, {
        status: 'ACCEPTED',
        selectedSlotId: slotId,
      })
      setSuccessMessage('Đã xác nhận lịch phỏng vấn thành công.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error accepting invitation:', err)
    }
  }

  const handleReject = async (invitationId) => {
    const rejectReason = (rejectReasonByInvitation[invitationId] || '').trim()
    if (!rejectReason) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      await respond(invitationId, {
        status: 'REJECTED',
        responseMessage: rejectReason,
      })
      setRejectReasonByInvitation((prev) => ({ ...prev, [invitationId]: '' }))
      setRespondingId(null)
      setSuccessMessage('Bạn đã từ chối lời mời phỏng vấn')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error rejecting invitation:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Đang tải lời mời...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-8 px-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Interview Invitation
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
          Lời mời phỏng vấn của bạn
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Chọn ca phù hợp và xác nhận ngay để giữ chỗ. Mỗi ca có giới hạn số lượng.
        </p>
      </div>

      {error && (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </Card>
      )}
      {successMessage && (
        <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </Card>
      )}

      {invitations.length === 0 ? (
        <EmptyState
          title="Bạn chưa có lời mời phỏng vấn"
          description="Khi employer gửi lời mời, danh sách sẽ hiển thị tại đây."
        />
      ) : (
        <>
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const statusBadge = STATUS_META[invitation.status] || {
                label: invitation.status,
                className: 'bg-slate-100 text-slate-600 border-slate-200',
              }

              const isExpired =
                invitation.campaign.expiresAt &&
                new Date(invitation.campaign.expiresAt) < new Date()

              const availableSlots = (invitation.campaign.slots || []).filter(
                (slot) => (slot.remainingSeats || 0) > 0,
              )

              const selectedSlot = invitation.selectedSlot
                ? `${formatDateTime(invitation.selectedSlot.startAt)} - ${formatDateTime(invitation.selectedSlot.endAt)}${invitation.selectedSlot.location ? ` | ${invitation.selectedSlot.location}` : ''}`
                : null

              return (
                <Card
                  key={invitation.id}
                  id={`invitation-${invitation.id}`}
                  className="rounded-2xl border-slate-200 p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {invitation.company?.logoUrl && (
                        <img
                          src={invitation.company.logoUrl}
                          alt={invitation.company?.name}
                          className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {invitation.campaign.title}
                        </h3>
                        {invitation.company && (
                          <p className="text-sm text-slate-500">{invitation.company.name}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={statusBadge.className}>
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nội dung từ employer
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                      {invitation.campaign.message}
                    </p>
                  </div>

                  {invitation.status === 'PENDING' && !isExpired && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-slate-800">Chọn ca phỏng vấn</p>
                      {availableSlots.length === 0 ? (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                          Hiện không còn ca nào trống. Vui lòng liên hệ employer để mở thêm ca.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(invitation.campaign.slots || []).map((slot) => {
                            const remainingSeats = slot.remainingSeats || 0
                            const isFull = remainingSeats <= 0
                            const isSelected =
                              Number(selectedSlotByInvitation[invitation.id]) === slot.id

                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={isFull}
                                onClick={() =>
                                  setSelectedSlotByInvitation((prev) => ({
                                    ...prev,
                                    [invitation.id]: slot.id,
                                  }))
                                }
                                className={`w-full rounded-xl border p-3 text-left transition ${
                                  isSelected
                                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                                    : 'border-slate-200 bg-white'
                                } ${isFull ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/60'}`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-600">
                                      Địa điểm: <span className="font-medium">{slot.location || 'Chưa cập nhật'}</span>
                                    </p>
                                  </div>
                                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {isFull ? 'Đã đầy' : `${remainingSeats}/${slot.capacity} chỗ`}
                                  </span>
                                </div>
                                {slot.note ? (
                                  <p className="mt-2 text-xs text-slate-500">Ghi chú: {slot.note}</p>
                                ) : null}
                                {isSelected && (
                                  <p className="mt-2 text-xs font-semibold text-primary">Bạn đang chọn ca này</p>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSlot ? (
                    <p className="mt-3 text-sm text-emerald-700">
                      Ca đã chọn: <span className="font-semibold">{selectedSlot}</span>
                    </p>
                  ) : null}

                  {invitation.responseMessage && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      <p>
                        <strong>Lý do từ chối:</strong> {invitation.responseMessage}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span>Nhận vào: {formatDateTime(invitation.createdAt)}</span>
                    {invitation.campaign.expiresAt && (
                      <span>
                        Hết hạn: {formatDateTime(invitation.campaign.expiresAt)}
                      </span>
                    )}
                  </div>

                  {invitation.status === 'PENDING' && !isExpired && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        className="rounded-full"
                        onClick={() => handleAccept(invitation.id)}
                      >
                        Chấp nhận và giữ chỗ
                      </Button>

                      {respondingId === invitation.id ? (
                        <div className="w-full space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <Textarea
                            placeholder="Nhập lý do từ chối..."
                            value={selectedRejectReason}
                            onChange={(e) =>
                              setRejectReasonByInvitation((prev) => ({
                                ...prev,
                                [invitation.id]: e.target.value,
                              }))
                            }
                            rows={3}
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(invitation.id)}
                            >
                              Xác nhận từ chối
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRespondingId(null)
                                setRejectReasonByInvitation((prev) => ({
                                  ...prev,
                                  [invitation.id]: '',
                                }))
                              }}
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setRespondingId(invitation.id)}
                        >
                          Từ chối
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => navigate('/chat')}
                      >
                        Mở chat với employer
                      </Button>
                    </div>
                  )}

                  {invitation.status !== 'PENDING' && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => navigate('/chat')}
                      >
                        Đi tới chat
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => navigate('/')}
                      >
                        Về trang chủ
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {pagination.total > PAGE_SIZE && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <span className="text-sm text-slate-600">
                Trang {page} / {Math.ceil(pagination.total / PAGE_SIZE)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(pagination.total / PAGE_SIZE)}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WorkerInvitations
