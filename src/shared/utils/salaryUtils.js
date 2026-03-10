const formatNumber = (num) => {
  if (!num) return '';
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const toMillion = (num) => {
  if (!num) return 0;
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return 0;

  const million = n / 1000000;
  return Number.isInteger(million)
    ? million
    : million.toFixed(1).replace('.', ',');
};

export const formatSalary = (min, max, variant = 'full') => {
  if (!min && !max) return 'Thỏa thuận';

  if (variant === 'compact') {
    const fMin = toMillion(min);
    const fMax = toMillion(max);

    if (min && max) return `${fMin} - ${fMax}tr`;
    return min ? `Từ ${fMin}tr` : `Đến ${fMax}tr`;
  }

  // Default 'full' variant
  const fMin = formatNumber(min);
  const fMax = formatNumber(max);

  if (min && max) return `${fMin} đ - ${fMax} đ/tháng`;
  return min ? `Từ ${fMin} đ/tháng` : `Đến ${fMax} đ/tháng`;
};
