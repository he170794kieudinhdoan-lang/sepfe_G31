import { resolveNotificationTarget } from './resolveNotificationTarget';

/**
 * @param {{ url?: string | null, raw?: object } | null | undefined} item
 */
export function getRawNotificationLink(item) {
  if (!item) return null;
  return (
    item.url ??
    item.raw?.link ??
    item.raw?.url ??
    item.raw?.targetUrl ??
    null
  );
}

/**
 * @param {{ url?: string | null, raw?: object } | null | undefined} item
 */
export function notificationHasNavigableTarget(item) {
  return resolveNotificationTarget(getRawNotificationLink(item)) != null;
}

/**
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {{ url?: string | null, raw?: object }} item
 */
export function navigateToNotification(navigate, item) {
  const target = resolveNotificationTarget(getRawNotificationLink(item));
  if (!target) return;

  if (target.kind === 'external') {
    window.location.assign(target.href);
    return;
  }

  navigate(target.to);
}
