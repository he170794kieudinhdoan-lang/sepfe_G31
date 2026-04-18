const getId = (item) => item?.id ?? item?._id ?? item?.notificationId;

/** Tách title / message để list hiển thị 2 tầng, gọn và dễ đọc */
const buildDisplay = (item) => {
    const rawTitle = typeof item?.title === 'string' ? item.title.trim() : '';
    const rawMessage = typeof item?.message === 'string' ? item.message.trim() : '';
    const legacy = item?.content != null ? String(item.content).trim() : '';

    if (rawTitle && rawMessage) {
        return {
            headline: rawTitle,
            detail: rawMessage,
            content: `${rawTitle} — ${rawMessage}`,
        };
    }
    const single = rawTitle || rawMessage || legacy || 'Bạn có thông báo mới.';
    return {
        headline: single,
        detail: null,
        content: single,
    };
};

const isRead = (item) => Boolean(item?.read ?? item?.isRead ?? item?.status === 'READ');
const getCreatedAt = (item) => item?.createdAt ?? item?.sentAt ?? item?.updatedAt ?? item?.time;
const getTargetUrl = (item) =>
    item?.url
    ?? item?.link
    ?? item?.targetUrl
    ?? item?.path
    ?? item?.redirectUrl
    ?? item?.metadata?.url
    ?? item?.raw?.url
    ?? item?.raw?.link
    ?? null;

export const formatNotificationTime = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && Number.isNaN(Date.parse(value))) return value;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays <= 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
};

export const normalizeNotifications = (payload) => {
    const source = Array.isArray(payload)
        ? payload
        : payload?.items ?? payload?.notifications ?? payload?.results ?? [];

    if (!Array.isArray(source)) return [];

    return source
        .map((item) => {
            const id = getId(item);
            if (!id) return null;

            const createdAt = getCreatedAt(item);
            const { headline, detail, content } = buildDisplay(item);

            return {
                id,
                headline,
                detail,
                content,
                read: isRead(item),
                createdAt,
                time: formatNotificationTime(createdAt),
                url: getTargetUrl(item),
                raw: item,
            };
        })
        .filter(Boolean)
        .sort((first, second) => {
            if (first.read !== second.read) return first.read ? 1 : -1;

            const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
            const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
            return secondTime - firstTime;
        });
};

export const getUnreadCount = (items) => items.filter((item) => !item.read).length;

/** Nội dung đầy đủ (tiêu đề + tin nhắn nếu API tách) — dùng cho dialog / tooltip */
export const getFullNotificationText = (item) => {
    if (!item) return '';
    const r = item.raw ?? {};
    const t = typeof r.title === 'string' ? r.title.trim() : '';
    const m = typeof r.message === 'string' ? r.message.trim() : '';
    if (t && m) return `${t}\n\n${m}`;
    if (m) return m;
    if (t) return t;
    return String(item.content ?? '').trim();
};