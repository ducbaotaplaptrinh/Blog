import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-brand)] flex items-center justify-center text-white font-bold text-xs">
                T
              </div>
              <span className="text-base font-bold text-[var(--color-text-primary)]">
                TechInsight<span className="text-[var(--color-brand)]">.</span>
              </span>
            </Link>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-sm leading-relaxed mb-4">
              Nền tảng chia sẻ kiến thức chuyên sâu về công nghệ, kỹ thuật lập trình web, kiến trúc phần mềm và giải pháp chuyển đổi số hiện đại.
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Được xây dựng trên nền tảng Next.js App Router, Express và PostgreSQL.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-3.5">
              Khám phá
            </h4>
            <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <li>
                <Link href="/" className="hover:text-[var(--color-brand)] transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[var(--color-brand)] transition-colors">
                  Tất cả bài viết
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--color-brand)] transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-brand)] transition-colors">
                  Liên hệ tòa soạn
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[var(--color-brand)] transition-colors">
                  Tìm kiếm bài viết
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-3.5">
              Tài nguyên & Dữ liệu
            </h4>
            <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <li>
                <Link href="/rss.xml" className="hover:text-[var(--color-brand)] transition-colors">
                  Nguồn cấp RSS 2.0
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-[var(--color-brand)] transition-colors">
                  Sơ đồ trang (Sitemap)
                </Link>
              </li>
              <li>
                <Link href="/robots.txt" className="hover:text-[var(--color-brand)] transition-colors">
                  Robots.txt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--color-text-muted)]">
          <p>© {currentYear} TechInsight. Mọi quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <span>Bản quyền nội dung & học thuật</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
