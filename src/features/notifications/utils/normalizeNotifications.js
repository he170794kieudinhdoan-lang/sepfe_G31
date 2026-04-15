const getId = (item) => item?.id ?? item?._id ?? item?.notificationId;
const getContent = (item) => item?.content ?? item?.message ?? item?.title ?? 'Bạn có thông báo mới.';
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

            return {
                id,
                content: getContent(item),
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