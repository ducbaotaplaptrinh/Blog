import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getPublishedPosts, getCategories } from '@/lib/api';
import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import BlogFilterBar from '@/components/blog/BlogFilterBar';
import { ChevronRight, ChevronLeft, BookOpen, Layers } from 'lucide-react';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await getCategories();
    const categories = res?.data || [];
    return categories.map((cat) => ({ slug: cat.slug }));
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await getCategoryBySlug(slug).catch(() => null);
  const category = res?.data;

  if (!category) {
    return { title: 'Không tìm thấy danh mục' };
  }

  return {
    title: `Chuyên mục: ${category.name}`,
    description: category.description || `Tổng hợp các bài viết thuộc chủ đề ${category.name} trên TechInsight Blog.`,
    openGraph: {
      title: `${category.name} - TechInsight Blog`,
      description: category.description || `Các bài viết hay về ${category.name}.`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams?.page || '1', 10));
  const sort = resolvedSearchParams?.sort || 'newest';
  const time = resolvedSearchParams?.time || 'all';
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

  const [categoryRes, postsRes, allCategoriesRes] = await Promise.all([
    getCategoryBySlug(slug).catch(() => null),
    getPublishedPosts({
      category: slug,
      page: currentPage,
      limit,
      search: search || undefined,
      sort,
      date_from,
      date_to,
    }).catch(() => ({ data: [] })),
    getCategories().catch(() => ({ data: [] })),
  ]);

  const category = categoryRes?.data;
  if (!category) {
    notFound();
  }

  const posts = postsRes?.data || [];
  const pagination = postsRes?.pagination || {
    page: currentPage,
    totalPages: Math.ceil((postsRes?.total || 0) / limit) || 1,
    total: postsRes?.total || posts.length,
  };
  const totalPages = pagination.totalPages || 1;

  // Tạo URL phân trang giữ nguyên bộ lọc trong chuyên mục
  const getPageUrl = (pageNumber) => {
    const query = new URLSearchParams();
    if (pageNumber > 1) query.set('page', String(pageNumber));
    if (sort && sort !== 'newest') query.set('sort', sort);
    if (time && time !== 'all') query.set('time', time);
    if (search) query.set('q', search);
    const qs = query.toString();
    return qs ? `/category/${slug}?${qs}` : `/category/${slug}`;
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn trang" className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
        <Link href="/" className="hover:text-[var(--color-brand)] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={12} className="opacity-50" />
        <Link href="/blog" className="hover:text-[var(--color-brand)] transition-colors">
          Chuyên mục
        </Link>
        <ChevronRight size={12} className="opacity-50" />
        <span className="text-[var(--color-text-primary)] font-medium">
          {category.name}
        </span>
      </nav>

      {/* Category Hero Banner */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-subtle)]">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-brand)] uppercase tracking-wider mb-2">
          <Layers size={13} />
          <span>Chuyên mục</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mb-2">
          {category.name}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
          {category.description || `Tổng hợp các bài viết mới nhất và kiến thức chuyên sâu về ${category.name}.`}
        </p>
      </div>

      {/* Category Slider */}
      {allCategoriesRes?.data?.length > 0 && (
        <div className="pb-3 border-b border-[var(--color-border)]">
          <CategoryFilter categories={allCategoriesRes.data} activeSlug={slug} />
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <BlogFilterBar
        totalPosts={pagination.total}
        categories={allCategoriesRes?.data || []}
        lockedCategory={slug}
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
            Không có bài viết nào phù hợp với bộ lọc trong chuyên mục này.
          </p>
          <Link
            href={`/category/${slug}`}
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <span>Xóa bộ lọc chuyên mục</span>
          </Link>
        </div>
      )}

      {/* Pagination */}
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
