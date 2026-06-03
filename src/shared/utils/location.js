export function normalizeLocationName(name) {
  if (!name) return '';
  return name
    .replace(
      /^(Tỉnh|Thành phố|TP\.?|Tp\.?|tp\.?|Quận|Huyện|Thị xã|Phường|Xã|Thị trấn)\s*/i,
      '',
    )
    .trim();
}
