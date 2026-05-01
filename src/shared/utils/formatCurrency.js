export const formatVND = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const n = typeof value === 'number' ? value : Number(String(value).replace(/\D/g, ''));
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('vi-VN').format(n);
};

export const parseNumber = (str) => {
  if (str === null || str === undefined) return 0;
  const s = String(str).replace(/\D/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

export default { formatVND, parseNumber };
