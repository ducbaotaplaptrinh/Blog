import Link from 'next/link';
import { getPublishedPosts, getTopPopularPosts, getCategories } from '@/lib/api';
import FeaturedHero from '@/components/blog/FeaturedHero';
import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import NewsletterBox from '@/components/blog/NewsletterBox';
import { ArrowRight, BookOpen, Layers } from 'lucide-react';
import { formatVietnameseDate, getImageUrl } from '@/lib/utils';
import Image from 'next/image';

export const revalidate = 60; // ISR 60 seconds

export default async function HomePage() {
  const [postsRes, popularRes, categoriesRes] = await Promise.all([
    getPublishedPosts({ limit: 7, page: 1 }).catch(() => ({ data: [] })),
    getTopPopularPosts(5).catch(() => ({ data: [] })),
    getCategories().catch(() => ({ data: [] })),
  ]);

  const posts = postsRes?.data || [];
  const popularPosts = popularRes?.data || [];
  const categories = categoriesRes?.data || [];

  const heroPost = posts[0] || popularPosts[0] || null;
  const remainingPosts = posts.slice(1);

  return (
    <div className="space-y-12">
      {/* Featured Hero */}
      {heroPost ? (
        <FeaturedHero post={heroPost} />
      ) : (
        <div className="text-center py-16 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-8">
          <BookOpen size={36} className="text-[var(--color-brand)] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Chào mừng bạn đến với TechInsight
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 max-w-sm mx-auto">
            Hệ thống đang chuẩn bị nội dung bài viết mới nhất. Hãy quay lại sau ít phút!
          </p>
        </div>
      )}

      {/* Categories Bar */}
      {categories.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider shrink-0">
            <Layers size={14} className="text-[var(--color-brand)]" />
            <span>Chủ đề</span>
          </div>
          <div className="min-w-0 flex-1 w-full overflow-hidden">
            <CategoryFilter categories={categories} />
          </div>
        </div>
      )}

      {/* Main Content Layout: Latest Posts Grid + Popular Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Latest Posts (8 cols) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
              Bài viết mới nhất
            </h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand)] hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {remainingPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {remainingPosts.map((post, idx) => (
                <PostCard key={post.id || post.slug} post={post} priority={idx < 2} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] italic py-8 text-center">
              Chưa có thêm bài viết nào.
            </p>
          )}

          {remainingPosts.length > 0 && (
            <div className="text-center pt-2">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text-primary)] transition-colors"
              >
                <span>Xem toàn bộ danh mục bài viết</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </section>

        {/* Sidebar: Popular Posts & Newsletter (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Top Popular Widget */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-subtle)]">
            <div className="pb-3 mb-4 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Đọc nhiều nhất
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                Các bài viết được quan tâm hàng đầu
              </p>
            </div>

            <div className="space-y-4">
              {popularPosts.map((item, index) => {
                const itemThumb = getImageUrl(item.thumbnail);
                return (
                  <article key={item.id || item.slug} className="group flex items-start gap-3">
                    <span className="text-base font-black text-[var(--color-text-muted)] w-5 shrink-0 pt-0.5">
                      0{index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/blog/${item.slug}`}
                        className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors line-clamp-2 leading-snug"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--color-text-muted)]">
                        <span>{formatVietnameseDate(item.published_at || item.created_at)}</span>
                        <span>•</span>
                        <span>{item.views_count ?? item.views ?? 0} xem</span>
                      </div>
                    </div>

                    {itemThumb && (
                      <div className="relative w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
                        <Image src={itemThumb} alt={item.title} fill className="object-cover" />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {/* Newsletter Box */}
          <NewsletterBox />
        </aside>
      </div>
    </div>
  );
}
