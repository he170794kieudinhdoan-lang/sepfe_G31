/**
 * Bỏ thẻ HTML, chuẩn hóa khoảng trắng.
 */
export function stripHtmlToPlainText(html) {
  if (html == null || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Cắt theo số từ (tách theo khoảng trắng), thêm dấu … nếu bị cắt.
 */
export function truncateByWords(text, maxWords = 120, suffix = '…') {
  const plain = stripHtmlToPlainText(text);
  if (!plain) return '';
  const words = plain.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return plain;
  return `${words.slice(0, maxWords).join(' ')}${suffix}`;
}
