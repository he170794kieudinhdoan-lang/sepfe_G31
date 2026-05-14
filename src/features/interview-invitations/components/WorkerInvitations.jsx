import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useWorkerInvitations, useRespondToInvitationMutation } from '../hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AppLoadingScene } from '@/shared/components/AppLoadingScene'
import { EmptyState } from '@/shared/components/EmptyState'

const PAGE_SIZE = 10

const STATUS_META = {
  PENDING: {
    label: 'Chờ trả lời',
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
    label: 'Hết hạn',
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

const WorkerInvitations = ({ embedded = false, type = 'interview' }) => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: invitationsData, isLoading: loading, error } = useWorkerInvitations(
    page,
    PAGE_SIZE,
    type
  )
  const invitations = invitationsData?.data || []
  const pagination = {
    total: invitationsData?.total || 0,
    page: invitationsData?.page || page,
    limit: invitationsData?.limit || PAGE_SIZE,
  }
  const { mutateAsync: respond } = useRespondToInvitationMutation()
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

  const handleSlotClick = async (invitationId, slotId, isCurrentlySelected) => {
    if (respondingId) return
    setRespondingId(invitationId)

    try {
      if (isCurrentlySelected) {
        await respond({
          invitationId,
          payload: { status: 'REJECTED' }
        })
        setSuccessMessage('Đã hủy khỏi ca phỏng vấn.')
      } else {
        await respond({
          invitationId,
          payload: { status: 'ACCEPTED', selectedSlotId: slotId }
        })
        setSuccessMessage('Đã nhận ca phỏng vấn.')
      }
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error responding to invitation:', err)
    } finally {
      setRespondingId(null)
    }
  }

  const handleJobInvitationRespond = async (invitationId, status) => {
    try {
      setRespondingId(invitationId)
      await respond({
        invitationId,
        payload: { status }
      })
      if (status === 'ACCEPTED') {
        setSuccessMessage('Bạn đã đồng ý ứng tuyển! Hồ sơ của bạn đã được chuyển đến nhà tuyển dụng.')
      } else {
        setSuccessMessage('Đã từ chối lời mời ứng tuyển.')
      }
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error responding to invitation:', err)
    } finally {
      setRespondingId(null)
    }
  }

  if (loading) {
    return <AppLoadingScene />
  }

  return (
    <div
      className={
        embedded
          ? 'space-y-4'
          : 'relative mx-auto max-w-6xl space-y-6 overflow-hidden px-4 py-8'
      }
    >
      {!embedded && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.06),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(255,255,255,0.72))]" />

          <div className="overflow-hidden rounded-[2rem] border border-amber-200/70 bg-white/85 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.24)] backdrop-blur">
            <div className="px-6 py-6 md:px-8">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                {type === 'job' ? 'Lời mời từ NTD' : 'Quản lý phỏng vấn'}
              </h2>
            </div>
          </div>
        </>
      )}

      {error && (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          {error}
        </Card>
      )}
      {successMessage && (
        <Card className="rounded-2xl border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
          {successMessage}
        </Card>
      )}

      {invitations.length === 0 ? (
        <EmptyState 
          title={type === 'job' ? 'Chưa có lời mời ứng tuyển' : 'Chưa có lời mời phỏng vấn'} 
          description="Quay lại sau." 
        />
      ) : (
        <>
          <div className="space-y-5">
            {invitations.map((invitation) => {
              const statusBadge = STATUS_META[invitation.status] || {
                label: invitation.status,
                className: 'bg-slate-100 text-slate-600 border-slate-200',
              }

              const isRescheduleExpired =
                invitation.campaign.expiresAt &&
                new Date(invitation.campaign.expiresAt) < new Date()

              const currentSelectedSlotId = invitation.selectedSlot?.id || null

              const selectableSlots = (invitation.campaign.slots || []).filter((slot) => {
                const remaining =
                  slot.remainingSeats ?? (slot.capacity - (slot.bookedCount || 0))
                return remaining > 0 || slot.id === currentSelectedSlotId
              })

              const preselectedSlotId =
                selectedSlotByInvitation[invitation.id] || currentSelectedSlotId

              const isSlotLess = (invitation.campaign.slots || []).length === 0

              const canChooseOrChangeSlot =
                (invitation.status === 'PENDING' || invitation.status === 'ACCEPTED' || invitation.status === 'REJECTED') &&
                !isRescheduleExpired

              return (
                <Card
                  key={invitation.id}
                  id={`invitation-${invitation.id}`}
                  className="overflow-hidden rounded-[1.75rem] border-slate-200 bg-white/95 p-0 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.35)]"
                >
                  <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-amber-50/70 px-5 py-5 md:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                          {invitation.company?.logoUrl ? (
                            <img
                              src={invitation.company.logoUrl}
                              alt={invitation.company?.name}
                              className="h-14 w-14 rounded-2xl object-cover"
                            />
                          ) : (
                            <span className="text-sm font-black text-slate-500">
                              {invitation.company?.name?.slice(0, 2)?.toUpperCase() || 'PV'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-xl font-black tracking-tight text-slate-950">
                              {invitation.campaign.title}
                            </h3>
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                              {statusBadge.label}
                            </span>
                          </div>
                          {invitation.company && (
                            <p className="mt-1 text-sm text-slate-500">
                              {invitation.company.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-white px-3 py-1.5 font-medium shadow-sm ring-1 ring-slate-200">
                        Gửi: {formatDateTime(invitation.createdAt)}
                      </span>
                      {invitation.campaign.expiresAt && (
                        <span className="rounded-full bg-white px-3 py-1.5 font-medium shadow-sm ring-1 ring-slate-200">
                          Hạn đổi lịch: {formatDateTime(invitation.campaign.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 px-5 py-5 md:grid-cols-[1.15fr_0.85fr] md:px-6">
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-slate-600">Tin công ty</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {invitation.campaign.message}
                        </p>
                      </div>

                      {(() => {
                        const locations = [...new Set((invitation.campaign.slots || []).map(s => s.location).filter(Boolean))]
                        const notes = [...new Set((invitation.campaign.slots || []).map(s => s.note).filter(Boolean))]
                        
                        return (
                          <>
                            {locations.length > 0 && (
                              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-semibold text-slate-600">Địa điểm phỏng vấn</p>
                                <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                                  {locations.map((loc, i) => (
                                    <li key={i} className="flex gap-2">
                                      <span className="text-slate-400">•</span>
                                      <span>{loc}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {notes.length > 0 && (
                              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-semibold text-slate-600">Ghi chú</p>
                                <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                                  {notes.map((note, i) => (
                                    <li key={i} className="flex gap-2 whitespace-pre-wrap">
                                      <span className="text-slate-400">•</span>
                                      <span>{note}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )
                      })()}

                      {invitation.responseMessage && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                            Lý do từ chối (đã gửi)
                          </p>
                          <p className="mt-2 whitespace-pre-wrap leading-6">
                            {invitation.responseMessage}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      {canChooseOrChangeSlot ? (
                        <p className="text-sm font-bold text-slate-900">
                          {isSlotLess
                            ? 'Phản hồi lời mời'
                            : invitation.status === 'ACCEPTED'
                              ? 'Đổi giờ'
                              : 'Chọn giờ'}
                        </p>
                      ) : null}

                      {canChooseOrChangeSlot ? (
                        isSlotLess ? (
                          <div className="flex flex-col gap-3">
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary-800">
                              Đây là lời mời ứng tuyển trực tiếp từ nhà tuyển dụng (chưa có lịch phỏng vấn).
                              Nếu bạn đồng ý, hồ sơ của bạn sẽ được đánh dấu Phù Hợp và chuyển đến nhà tuyển dụng để xếp lịch phỏng vấn sau.
                            </div>
                            <div className="flex gap-3">
                              <Button
                                className="flex-1 rounded-xl"
                                disabled={respondingId === invitation.id}
                                onClick={() => handleJobInvitationRespond(invitation.id, 'ACCEPTED')}
                              >
                                Tôi đồng ý
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 rounded-xl"
                                disabled={respondingId === invitation.id}
                                onClick={() => handleJobInvitationRespond(invitation.id, 'REJECTED')}
                              >
                                Từ chối
                              </Button>
                            </div>
                          </div>
                        ) : selectableSlots.length === 0 ? (
                          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-800">
                            Hết suất. Nhắn công ty.
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {(invitation.campaign.slots || []).map((slot) => {
                              const remainingSeats =
                                slot.remainingSeats ??
                                Math.max(0, slot.capacity - (slot.bookedCount || 0))
                                const isCurrentSelected = slot.id === currentSelectedSlotId
                              const isFull = remainingSeats <= 0 && !isCurrentSelected

                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  disabled={isFull || respondingId === invitation.id}
                                  onClick={() => handleSlotClick(invitation.id, slot.id, isCurrentSelected)}
                                  className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
                                    isCurrentSelected
                                      ? 'border-primary/60 bg-primary/8 shadow-[0_10px_24px_-18px_rgba(245,158,11,0.65)] ring-1 ring-primary/30'
                                      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm'
                                  } ${isFull ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-950">
                                        {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                                      </p>
                                    </div>
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        isFull
                                          ? 'bg-rose-100 text-rose-700'
                                          : 'bg-emerald-100 text-emerald-700'
                                      }`}
                                    >
                                      {isFull ? 'Hết chỗ' : `Còn ${remainingSeats} chỗ / ${slot.capacity}`}
                                    </span>
                                  </div>
                                  {isCurrentSelected ? (
                                    <p className="mt-2 text-xs font-medium text-primary">
                                      Đang chọn (bấm lại để hủy)
                                    </p>
                                  ) : (
                                    <p className="mt-2 text-xs font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                      Bấm để chọn
                                    </p>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          {invitation.status === 'ACCEPTED'
                            ? isSlotLess
                              ? 'Bạn đã đồng ý ứng tuyển.'
                              : isRescheduleExpired
                                ? 'Đã quá hạn đổi lịch. Lịch đã chốt.'
                                : 'Lịch đã lưu.'
                            : invitation.status === 'REJECTED'
                              ? 'Đã từ chối.'
                              : 'Không chọn giờ ở đây.'}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="rounded-full border-slate-200 px-5 shadow-sm"
                          onClick={() => navigate('/chat')}
                        >
                          Nhắn công ty
                        </Button>
                        <Button
                          variant="ghost"
                          className="rounded-full px-5 text-slate-600 hover:bg-slate-100"
                          onClick={() => navigate('/')}
                        >
                          Về trang chính
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {pagination.total > PAGE_SIZE && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-slate-200 px-4"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <span className="text-sm font-medium text-slate-600">
                Trang {page} / {Math.ceil(pagination.total / PAGE_SIZE)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-slate-200 px-4"
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
