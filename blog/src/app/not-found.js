import Link from 'next/link';

export const metadata = {
  title: '404 - Không tìm thấy trang',
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.',
};

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] text-[var(--color-brand)] font-bold text-2xl mb-4 border border-[var(--color-border)]">
        404
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2">
        Không tìm thấy trang
      </h1>
      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-sm mb-6 leading-relaxed">
        Bài viết hoặc trang bạn đang tìm kiếm có thể đã bị xóa, đổi đường dẫn hoặc tạm thời không khả dụng.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-medium text-xs transition-colors"
        >
          Về trang chủ
        </Link>
        <Link
          href="/blog"
          className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface)] text-[var(--color-text-primary)] font-medium text-xs transition-colors"
        >
          Duyệt bài viết
        </Link>
      </div>
    </div>
  );
}
