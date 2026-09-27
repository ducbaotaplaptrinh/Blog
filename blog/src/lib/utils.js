/**
 * Định dạng ngày tháng tiếng Việt
 */
export function formatVietnameseDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
export const formatDateVi = formatVietnameseDate;

/**
 * Tính toán ước tính thời gian đọc (Reading Time)
 * Trung bình 200 từ tiếng Việt / phút
 */
export function estimateReadingTime(textOrHtml) {
  if (!textOrHtml) return 1;
  const plainText = textOrHtml.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}
export function calculateReadingTime(textOrHtml) {
  return `${estimateReadingTime(textOrHtml)} phút đọc`;
}

/**
 * Trích xuất tóm tắt ngắn từ nội dung
 */
export function getExcerpt(content, maxLength = 160) {
  if (!content) return '';
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.substring(0, maxLength)}...`;
}
export const createExcerpt = getExcerpt;

/**
 * Chuẩn hóa URL ảnh (hỗ trợ uploads backend và ảnh bên ngoài)
 */
export function getImageUrl(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null;
  const normalized = pathOrUrl.trim().replace(/\\/g, '/');
  if (!normalized) return null;
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${backendBase}${cleanPath}`;
}
