import Link from 'next/link';
import { getPublishedPosts, getCategories } from '@/lib/api';
import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import BlogFilterBar from '@/components/blog/BlogFilterBar';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Tất cả bài viết',
  description: 'Danh sách toàn bộ các bài viết, cẩm nang và hướng dẫn công nghệ lập trình.',
};

export default async function BlogListPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams?.page || '1', 10));
  const sort = resolvedSearchParams?.sort || 'newest';
  const time = resolvedSearchParams?.time || 'all';
  const category = resolvedSearchParams?.category || '';
  const search = resolvedSearchParams?.q?.trim() || '';
  const limit = 9;

  // Tính toán khoảng ngày theo preset time
  let date_from = null;
  let date_to = null;
  const now = new Date();
  const toISO = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (time === 'week') {
    date_from = toISO(new Date(Date.now() - 7 * 86400000));
    date_to = toISO(now);
  } else if (time === 'month') {
    date_from = toISO(new Date(Date.now() - 30 * 86400000));
    date_to = toISO(now);
  } else if (time === 'year') {
    date_from = `${now.getFullYear()}-01-01`;
    date_to = toISO(now);
  }

  const [postsRes, categoriesRes] = await Promise.all([
    getPublishedPosts({
      page: currentPage,
      limit,
      category: category || undefined,
      search: search || undefined,
      sort,
      date_from,
      date_to,
    }).catch(() => ({ data: [], pagination: {} })),
    getCategories().catch(() => ({ data: [] })),
  ]);

  const posts = postsRes?.data || [];
  const pagination = postsRes?.pagination || {
    page: currentPage,
    totalPages: Math.ceil((postsRes?.total || 0) / limit) || 1,
    total: postsRes?.total || posts.length,
  };

  const totalPages = pagination.totalPages || 1;

  // Tạo URL phân trang giữ nguyên bộ lọc
  const getPageUrl = (pageNumber) => {
    const params = new URLSearchParams();
    if (pageNumber > 1) params.set('page', String(pageNumber));
    if (sort && sort !== 'newest') params.set('sort', sort);
    if (time && time !== 'all') params.set('time', time);
    if (category) params.set('category', category);
    if (search) params.set('q', search);
    const qs = params.toString();
    return qs ? `/blog?${qs}` : '/blog';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-2">
          Tất cả bài viết
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Khám phá toàn bộ các bài phân tích chuyên sâu, chia sẻ kỹ thuật và cập nhật công nghệ mới nhất từ đội ngũ tác giả.
        </p>
      </div>

      {/* Category Slider */}
      {categoriesRes?.data?.length > 0 && (
        <div className="pb-3 border-b border-[var(--color-border)]">
          <CategoryFilter categories={categoriesRes.data} activeSlug={category} />
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <BlogFilterBar
        totalPosts={pagination.total}
        categories={categoriesRes?.data || []}
      />

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <PostCard key={post.id || post.slug} post={post} priority={idx < 3} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-8">
          <BookOpen size={36} className="text-[var(--color-text-muted)] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Không tìm thấy bài viết nào
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Không có bài viết nào phù hợp với bộ lọc và từ khóa hiện tại.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <span>Xóa bộ lọc & xem tất cả</span>
          </Link>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={getPageUrl(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text-primary)] transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Trước</span>
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] opacity-40 cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              <span>Trước</span>
            </button>
          )}

          <span className="text-xs font-medium text-[var(--color-text-muted)] px-3">
            Trang {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={getPageUrl(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text-primary)] transition-colors"
            >
              <span>Sau</span>
              <ChevronRight size={14} />
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] opacity-40 cursor-not-allowed"
            >
              <span>Sau</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
