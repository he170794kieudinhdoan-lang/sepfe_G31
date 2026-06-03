/**
 * Việt hoá tiêu đề/nội dung thông báo cũ (DB) hoặc chuỗi còn sót tiếng Anh.
 */
const TITLE_REPLACEMENTS = [
  [/^Boost job thành công$/i, 'Đẩy tin nổi bật thành công'],
  [/^Boost thành công$/i, 'Đẩy tin nổi bật thành công'],
  [/^Job saved successfully$/i, 'Đã lưu tin tuyển dụng'],
  [/^Job already saved$/i, 'Tin đã được lưu trước đó'],
  [/^Job unsaved successfully$/i, 'Đã bỏ lưu tin tuyển dụng'],
  [/^Job not saved yet$/i, 'Tin chưa được lưu'],
  [/^Thanh toán nạp point thành công$/i, 'Thanh toán nạp điểm thành công'],
  [/^Nạp point thành công$/i, 'Nạp điểm thành công'],
];

const INLINE_REPLACEMENTS = [
  [/Boost job/gi, 'đẩy tin nổi bật'],
  [/\bboost\b/gi, 'đẩy tin'],
  [/\bjob\b/gi, 'tin tuyển dụng'],
  [/\bpoint\b/gi, 'điểm'],
];

export function localizeNotificationText(text) {
  if (text == null) return text;
  const raw = String(text).trim();
  if (!raw) return raw;

  let result = raw;
  for (const [pattern, replacement] of TITLE_REPLACEMENTS) {
    if (pattern.test(result)) {
      return replacement;
    }
  }
  for (const [pattern, replacement] of INLINE_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
