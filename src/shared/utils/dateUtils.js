import { differenceInDays, format, formatDistanceToNow } from 'date-fns';
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
