import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useWorkerInvitations, useRespondToInvitationMutation } from '../hooks'
import { useGetOrCreateConversation } from '@/features/chat/api/useChat'
import { useToast } from '@/shared/contexts/ToastContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AppLoadingScene } from '@/shared/components/AppLoadingScene'
import { AppPagination } from '@/shared/components/AppPagination'
import { EmptyState } from '@/shared/components/EmptyState'
import { Modal } from '@/shared/components/Modal'
import { Loader2 } from 'lucide-react'

const PAGE_SIZE = 5

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

const isCampaignExpired = (expiresAt) => {
  if (!expiresAt) return false
  const deadline = new Date(expiresAt)
  return !Number.isNaN(deadline.getTime()) && deadline < new Date()
}

const getDisplayStatus = (invitation) => {
  if (
    invitation.status === 'PENDING' &&
    isCampaignExpired(invitation.campaign?.expiresAt)
  ) {
    return 'EXPIRED'
  }
  return invitation.status
}

const WorkerInvitations = ({ embedded = false, type = 'interview' }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { mutate: openCompanyChat, isPending: isOpeningChat } =
    useGetOrCreateConversation()
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    data: invitationsData,
    isLoading: loading,
    isFetching,
    isPlaceholderData,
    error,
  } = useWorkerInvitations(page, PAGE_SIZE, type)
  const invitations = invitationsData?.data || []
  const pagination = {
    total: invitationsData?.total || 0,
    page: invitationsData?.page || page,
    limit: invitationsData?.limit || PAGE_SIZE,
  }
  const totalPages =
    invitationsData?.totalPages ??
    Math.max(1, Math.ceil(pagination.total / PAGE_SIZE))
  const isPageTransition = isFetching && isPlaceholderData

  useEffect(() => {
    setPage(1)
  }, [type])

  useEffect(() => {
    if (loading) return
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [loading, page, totalPages])
  const { mutateAsync: respond } = useRespondToInvitationMutation()
  const [pendingAction, setPendingAction] = useState(null)
  const [selectedSlotByInvitation, setSelectedSlotByInvitation] = useState({})
  const [rejectReasonByInvitation, setRejectReasonByInvitation] = useState({})
  const [expandedId, setExpandedId] = useState(null)

  const invitationIdFromUrl = searchParams.get('invitationId')
  useEffect(() => {
    if (!invitationIdFromUrl || loading) return
    const idNum = Number(invitationIdFromUrl)
    setExpandedId(idNum)
    const el = document.getElementById(`invitation-${idNum}`)
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
  const [confirmRespond, setConfirmRespond] = useState(null)

  const handleMessageCompany = (ownerId) => {
    if (!ownerId) {
      toast('Không tìm thấy thông tin nhà tuyển dụng để nhắn tin', 'error')
      return
    }
    openCompanyChat({ participantId: ownerId })
  }

  const isInvitationBusy = (invitationId) =>
    pendingAction?.invitationId === invitationId

  const isSlotBusy = (invitationId, slotId) =>
    pendingAction?.invitationId === invitationId &&
    pendingAction?.type === 'slot' &&
    pendingAction?.slotId === slotId

  const isRejectBusy = (invitationId) =>
    pendingAction?.invitationId === invitationId &&
    pendingAction?.type === 'reject'

  const handleSlotClick = async (invitationId, slotId, isCurrentlySelected) => {
    if (pendingAction) return
    if (isCurrentlySelected) return

    setPendingAction({ invitationId, type: 'slot', slotId })
    try {
      await respond({
        invitationId,
        payload: { status: 'ACCEPTED', selectedSlotId: slotId },
      })
      setSuccessMessage('Đã nhận ca phỏng vấn.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Không thể chọn ca phỏng vấn. Vui lòng thử lại.'
      toast(Array.isArray(message) ? message.join(', ') : message, 'error')
    } finally {
      setPendingAction(null)
    }
  }

  const handleInvitationRespond = async (invitationId, payload) => {
    const isReject = payload.status === 'REJECTED'
    setPendingAction({
      invitationId,
      type: isReject ? 'reject' : 'slot',
      slotId: payload.selectedSlotId,
    })
    try {
      await respond({ invitationId, payload })
      if (payload.status === 'ACCEPTED') {
        setSuccessMessage(
          payload.selectedSlotId
            ? 'Đã nhận ca phỏng vấn.'
            : 'Bạn đã đồng ý ứng tuyển! Hồ sơ của bạn đã được chuyển đến nhà tuyển dụng.',
        )
      } else {
        setSuccessMessage(
          'Đã ghi nhận bạn không tham gia được. Bạn vẫn có thể chọn ca khác nếu sắp xếp được.',
        )
      }
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.'
      toast(Array.isArray(message) ? message.join(', ') : message, 'error')
    } finally {
      setPendingAction(null)
    }
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
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-slate-50 to-transparent" />

          <div className="mb-6 px-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {type === 'job' ? 'Thư Mời Ứng Tuyển' : 'Lịch Phỏng Vấn'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {type === 'job' ? 'Xem và phản hồi các cơ hội việc làm dành riêng cho bạn.' : 'Quản lý lịch hẹn phỏng vấn từ các nhà tuyển dụng.'}
            </p>
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

      {loading ? (
        <AppLoadingScene />
      ) : invitations.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title={
              pagination.total > 0 && page > 1
                ? 'Trang này không có lời mời'
                : type === 'job'
                  ? 'Chưa có lời mời ứng tuyển'
                  : 'Chưa có lời mời phỏng vấn'
            }
            description={
              pagination.total > 0 && page > 1
                ? 'Vui lòng quay lại trang trước.'
                : 'Quay lại sau.'
            }
          />
          {pagination.total > 0 && page > 1 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setPage(1)}
              >
                Về trang 1
              </Button>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-sm text-slate-500 sm:text-left">
                Trang {page}/{totalPages} · Tổng {pagination.total} lời mời
              </p>
              <AppPagination
                page={page}
                totalPage={totalPages}
                onPageChange={setPage}
                className="justify-center mt-0"
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            className={`space-y-5 transition-opacity ${isPageTransition ? 'pointer-events-none opacity-50' : ''}`}
          >
            {invitations.map((invitation) => {
              const displayStatus = getDisplayStatus(invitation)
              const statusBadge = STATUS_META[displayStatus] || {
                label: displayStatus,
                className: 'bg-slate-100 text-slate-600 border-slate-200',
              }

              const isRescheduleExpired = isCampaignExpired(
                invitation.campaign?.expiresAt,
              )

              const currentSelectedSlotId = invitation.selectedSlot?.id || null

              const selectableSlots = (invitation.campaign.slots || []).filter((slot) => {
                const remaining =
                  slot.remainingSeats ?? (slot.capacity - (slot.bookedCount || 0))
                return remaining > 0 || slot.id === currentSelectedSlotId
              })

              const preselectedSlotId =
                selectedSlotByInvitation[invitation.id] || currentSelectedSlotId

              const isSlotLess = (invitation.campaign.slots || []).length === 0

              const allSlotsPast =
                !isSlotLess &&
                (invitation.campaign.slots || []).length > 0 &&
                (invitation.campaign.slots || []).every(
                  (slot) => new Date(slot.startAt) <= new Date(),
                )

              const canChooseOrChangeSlot =
                (invitation.status === 'PENDING' || invitation.status === 'ACCEPTED' || invitation.status === 'REJECTED') &&
                !isRescheduleExpired &&
                !allSlotsPast

              const isExpanded = expandedId === invitation.id

              return (
                <Card
                  key={invitation.id}
                  id={`invitation-${invitation.id}`}
                  className={`group overflow-hidden transition-all duration-300 border-slate-200 bg-white shadow-sm hover:shadow-md ${isExpanded ? 'rounded-[1.25rem] ring-1 ring-primary/20' : 'rounded-[1rem] cursor-pointer hover:border-slate-300'}`}
                >
                  {/* Compact Header */}
                  <div
                    className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/60 border-b border-slate-100' : 'hover:bg-slate-50/50'}`}
                    onClick={() => setExpandedId(isExpanded ? null : invitation.id)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                        {invitation.company?.logoUrl ? (
                          <img
                            src={invitation.company.logoUrl}
                            alt={invitation.company?.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-black text-slate-400">
                            {invitation.company?.name?.slice(0, 2)?.toUpperCase() || 'PV'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {invitation.campaign.title}
                        </h3>
                        <p className="truncate text-[13px] font-medium text-slate-500 mt-0.5">
                          {invitation.company?.name || 'Công ty ẩn danh'}
                        </p>
                      </div>
                    </div>

                    <div className="ml-16 flex shrink-0 items-center gap-2 self-start sm:ml-0 sm:gap-3 sm:self-auto">
                      <span
                        className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold leading-none ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                      <span className="text-[12px] font-medium text-slate-400 whitespace-nowrap">
                        {formatDateTime(invitation.createdAt)}
                      </span>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                        <svg className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Body */}
                  {isExpanded && (
                    <div className="grid gap-4 px-5 py-5 md:grid-cols-[1.1fr_0.9fr] md:px-6 bg-white animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-slate-600">Tin công ty</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {invitation.campaign.message}
                        </p>
                      </div>

                      {(() => {
                        if (invitation.status === 'REJECTED') return null;
                        if (!preselectedSlotId) return null;

                        const selectedSlot = (invitation.campaign.slots || []).find(s => s.id === preselectedSlotId);
                        if (!selectedSlot) return null;

                        const locations = [selectedSlot.location].filter(Boolean);
                        const notes = [selectedSlot.note].filter(Boolean);

                        if (locations.length === 0 && notes.length === 0) return null;
                        
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

                      {isSlotLess ? (
                        canChooseOrChangeSlot ? (
                          <div className="flex flex-col gap-3">
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary-800">
                              Đây là lời mời ứng tuyển trực tiếp từ nhà tuyển dụng (chưa có lịch phỏng vấn).
                              Nếu bạn đồng ý, hồ sơ của bạn sẽ được đánh dấu Phù Hợp và chuyển đến nhà tuyển dụng để xếp lịch phỏng vấn sau.
                            </div>
                            <div className="grid gap-3">
                              <button
                                type="button"
                                disabled={isInvitationBusy(invitation.id) || invitation.status !== 'PENDING'}
                                onClick={() => setConfirmRespond({ invitationId: invitation.id, payload: { status: 'ACCEPTED' }, title: 'Xác nhận đồng ý ứng tuyển', desc: 'Bạn có chắc chắn muốn đồng ý ứng tuyển? Lựa chọn này chỉ được thực hiện một lần duy nhất và không thể thay đổi sau đó.' })}
                                className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
                                  invitation.status === 'ACCEPTED'
                                    ? 'border-primary/60 bg-primary/8 shadow-[0_10px_24px_-18px_rgba(245,158,11,0.65)] ring-1 ring-primary/30 cursor-default'
                                    : invitation.status !== 'PENDING'
                                      ? 'border-slate-200 bg-white opacity-60 cursor-not-allowed'
                                      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className={`text-sm font-semibold ${invitation.status === 'ACCEPTED' ? 'text-primary-700' : 'text-slate-950'}`}>
                                      Tôi đồng ý ứng tuyển
                                    </p>
                                  </div>
                                </div>
                                {invitation.status === 'ACCEPTED' ? (
                                  <p className="mt-2 text-xs font-medium text-primary">Đã chọn</p>
                                ) : (
                                  invitation.status === 'PENDING' && (
                                    <p className="mt-2 text-xs font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Bấm để chọn</p>
                                  )
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={isInvitationBusy(invitation.id) || invitation.status !== 'PENDING'}
                                onClick={() => setConfirmRespond({ invitationId: invitation.id, payload: { status: 'REJECTED' }, title: 'Xác nhận từ chối ứng tuyển', desc: 'Bạn có chắc chắn muốn từ chối ứng tuyển? Lựa chọn này chỉ được thực hiện một lần duy nhất và không thể thay đổi sau đó.', tone: 'danger' })}
                                className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
                                  invitation.status === 'REJECTED'
                                    ? 'border-rose-400 bg-rose-50 shadow-[0_10px_24px_-18px_rgba(244,63,94,0.65)] ring-1 ring-rose-200 cursor-default'
                                    : invitation.status !== 'PENDING'
                                      ? 'border-slate-200 bg-white opacity-60 cursor-not-allowed'
                                      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className={`text-sm font-semibold ${invitation.status === 'REJECTED' ? 'text-rose-700' : 'text-slate-700'}`}>
                                      Tôi từ chối ứng tuyển
                                    </p>
                                  </div>
                                </div>
                                {invitation.status === 'REJECTED' ? (
                                  <p className="mt-2 text-xs font-medium text-rose-600">Đã chọn</p>
                                ) : (
                                  invitation.status === 'PENDING' && (
                                    <p className="mt-2 text-xs font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Bấm để chọn</p>
                                  )
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            {invitation.status === 'ACCEPTED'
                              ? 'Bạn đã đồng ý ứng tuyển.'
                              : invitation.status === 'REJECTED'
                                ? 'Đã từ chối.'
                                : isRescheduleExpired
                                  ? 'Đã quá hạn phản hồi.'
                                  : 'Không chọn giờ ở đây.'}
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col gap-3">
                          {invitation.status === 'REJECTED' && canChooseOrChangeSlot && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
                              Bạn đã báo không tham gia được. Nếu sắp xếp lại được, hãy chọn ca phỏng vấn bên dưới.
                            </div>
                          )}
                          <div className="grid gap-3">
                            {(invitation.campaign.slots || []).map((slot) => {
                              const isPast = new Date(slot.startAt) <= new Date()
                              const remainingSeats =
                                slot.remainingSeats ??
                                Math.max(0, slot.capacity - (slot.bookedCount || 0))
                              const isCurrentSelected = slot.id === currentSelectedSlotId
                              const isFull = remainingSeats <= 0 && !isCurrentSelected
                              const slotLoading = isSlotBusy(invitation.id, slot.id)
                              const isDisabled =
                                isPast ||
                                isFull ||
                                isInvitationBusy(invitation.id) ||
                                !canChooseOrChangeSlot

                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => {
                                    if (canChooseOrChangeSlot && !isPast) {
                                      handleSlotClick(invitation.id, slot.id, isCurrentSelected)
                                    }
                                  }}
                                  className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
                                    isCurrentSelected
                                      ? 'border-primary/60 bg-primary/8 shadow-[0_10px_24px_-18px_rgba(245,158,11,0.65)] ring-1 ring-primary/30'
                                      : isPast
                                        ? 'border-slate-200 bg-slate-50'
                                        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm'
                                  } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className={`text-sm font-semibold ${isPast ? 'text-slate-400' : 'text-slate-950'}`}>
                                        {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                                      </p>
                                    </div>
                                    <span
                                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        isPast
                                          ? 'bg-slate-100 text-slate-500'
                                          : slotLoading
                                            ? 'bg-slate-100 text-slate-600'
                                            : isFull && !isCurrentSelected
                                              ? 'bg-rose-100 text-rose-700'
                                              : 'bg-emerald-100 text-emerald-700'
                                      }`}
                                    >
                                      {isPast ? 'Đã qua' : slotLoading ? (
                                        <>
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          Đang lưu…
                                        </>
                                      ) : isFull && !isCurrentSelected ? (
                                        'Hết chỗ'
                                      ) : (
                                        `Còn ${remainingSeats} chỗ / ${slot.capacity}`
                                      )}
                                    </span>
                                  </div>
                                  {isPast ? (
                                    <p className="mt-2 text-xs font-medium text-slate-400">
                                      Ca này đã diễn ra rồi
                                    </p>
                                  ) : isCurrentSelected ? (
                                    <p className="mt-2 text-xs font-medium text-primary">
                                      Đã chọn
                                    </p>
                                  ) : (
                                    canChooseOrChangeSlot && !isFull && (
                                      <p className="mt-2 text-xs font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Bấm để chọn
                                      </p>
                                    )
                                  )}
                                </button>
                              )
                            })}

                            <button
                              type="button"
                              disabled={isInvitationBusy(invitation.id) || !canChooseOrChangeSlot}
                              onClick={() => {
                                if (!canChooseOrChangeSlot || isInvitationBusy(invitation.id)) return
                                handleInvitationRespond(invitation.id, { status: 'REJECTED' })
                              }}
                              className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
                                invitation.status === 'REJECTED'
                                  ? 'border-rose-300/80 bg-rose-50/80'
                                  : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-sm'
                              } ${!canChooseOrChangeSlot ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p
                                    className={`text-sm font-semibold ${
                                      invitation.status === 'REJECTED'
                                        ? 'text-rose-700'
                                        : 'text-slate-700'
                                    }`}
                                  >
                                    Tôi không tham gia được
                                  </p>
                                </div>
                                {isRejectBusy(invitation.id) && (
                                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-rose-600" />
                                )}
                              </div>
                                  <p className="mt-2 text-xs font-medium text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
                                    Bấm nếu bạn bận toàn bộ các ca
                                  </p>
                            </button>
                          </div>

                          {canChooseOrChangeSlot && selectableSlots.length === 0 && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-800">
                              Hết suất. Nhắn công ty.
                            </div>
                          )}
                          {!canChooseOrChangeSlot && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                              {allSlotsPast && isRescheduleExpired
                                ? 'Các ca phỏng vấn đã qua và đã quá hạn chọn lịch. Vui lòng liên hệ nhà tuyển dụng để sắp xếp lại.'
                                : allSlotsPast
                                  ? 'Các ca phỏng vấn đã qua. Vui lòng liên hệ nhà tuyển dụng để sắp xếp lại.'
                                  : displayStatus === 'EXPIRED'
                                    ? 'Đã quá hạn chọn lịch phỏng vấn. Vui lòng liên hệ nhà tuyển dụng để sắp xếp lại.'
                                    : invitation.status === 'ACCEPTED'
                                      ? isRescheduleExpired
                                        ? 'Đã quá hạn đổi lịch. Lịch đã chốt.'
                                        : 'Lịch đã lưu.'
                                      : invitation.status === 'REJECTED'
                                        ? 'Đã báo không tham gia được.'
                                        : 'Không chọn giờ ở đây.'}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {invitation.campaign.jobId && (
                          <Button
                            variant="default"
                            className="rounded-full px-5 shadow-sm"
                            onClick={() => navigate(`/job/${invitation.campaign.jobId}`)}
                          >
                            Xem tin tuyển dụng
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="rounded-full border-slate-200 px-5 shadow-sm"
                          disabled={isOpeningChat}
                          onClick={() =>
                            handleMessageCompany(invitation.company?.ownerId)
                          }
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
                  )}
                </Card>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-sm text-slate-500 sm:text-left">
                Trang {page}/{totalPages} · Tổng {pagination.total} lời mời
              </p>
              <AppPagination
                page={page}
                totalPage={totalPages}
                onPageChange={setPage}
                className="justify-center mt-0"
              />
            </div>
          )}
        </>
      )}

      <Modal
        open={!!confirmRespond}
        onClose={() => setConfirmRespond(null)}
        title={confirmRespond?.title || 'Xác nhận'}
        description={confirmRespond?.desc}
        tone={confirmRespond?.tone || 'default'}
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
        onConfirm={async () => {
          if (!confirmRespond) return
          const { invitationId, payload } = confirmRespond
          setConfirmRespond(null)
          await handleInvitationRespond(invitationId, payload)
        }}
      />
    </div>
  )
}

export default WorkerInvitations
