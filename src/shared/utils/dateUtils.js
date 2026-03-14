import {
  differenceInDays,
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from 'date-fns';
import { vi } from 'date-fns/locale';

export const getDaysLeft = (expiryDate) => {
  if (!expiryDate) return 0;

  const days = differenceInDays(new Date(expiryDate), new Date());

  return days > 0 ? days : 0;
};

export const formatRelativeTime = (date) => {
  if (!date) return '';

  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: vi,
  });
};

export const formatInVN = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return '';

  return format(new Date(date), pattern, { locale: vi });
};

export const formatMessageTime = (date) => {
  if (!date) return '';

  const d = new Date(date);

  if (isToday(d)) {
    return format(d, 'HH:mm');
  }

  if (isYesterday(d)) {
    return 'Hôm qua ' + format(d, 'HH:mm');
  }

  return format(d, 'dd/MM HH:mm');
};
