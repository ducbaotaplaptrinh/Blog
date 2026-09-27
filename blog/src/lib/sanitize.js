import sanitizeHtml from 'sanitize-html';

/**
 * Khử độc mã HTML từ Rich Text Editor để ngăn chặn 100% tấn công XSS
 * Hỗ trợ chuẩn hóa URL ảnh nội dung và xử lý ảnh an toàn
 */
export function sanitizePostContent(dirtyHtml) {
  if (!dirtyHtml) return '';

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'blockquote', 'code', 'pre',
      'ul', 'ol', 'li',
      'a', 'img',
      'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title', 'class'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
      code: ['class'],
      pre: ['class'],
      span: ['class', 'style'],
      p: ['class'],
      h1: ['class', 'id'],
      h2: ['class', 'id'],
      h3: ['class', 'id'],
      h4: ['class', 'id'],
      div: ['class'],
      blockquote: ['class'],
      table: ['class'],
      th: ['class', 'scope'],
      td: ['class'],
    },
    // Cho phép data: để hỗ trợ hiển thị các ảnh bài viết cũ đã lỡ chèn Base64
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
    transformTags: {
      a: (tagName, attribs) => {
        const isExternal = attribs.href && !attribs.href.startsWith('/') && !attribs.href.startsWith('#');
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
            class: `${attribs.class || ''} text-[var(--color-brand)] underline underline-offset-2 hover:opacity-85 transition-opacity`,
          },
        };
      },
      img: (tagName, attribs) => {
        let src = attribs.src || '';

        // Tự động chuẩn hóa nếu đường dẫn tương đối từ backend
        if (src.startsWith('/uploads/')) {
          src = `${backendBase}${src}`;
        } else if (src.startsWith('uploads/')) {
          src = `${backendBase}/${src}`;
        }

        return {
          tagName: 'img',
          attribs: {
            ...attribs,
            src,
            loading: 'lazy',
            class: `${attribs.class || ''} rounded-[var(--radius-lg)] max-w-full h-auto my-6 border border-[var(--color-border)] shadow-[var(--shadow-subtle)]`,
          },
        };
      },
    },
  });
}
