import Link from 'next/link';
import Image from 'next/image';
import { formatVietnameseDate, estimateReadingTime, getExcerpt, getImageUrl } from '@/lib/utils';
import { Clock, ArrowRight } from 'lucide-react';

export default function FeaturedHero({ post }) {
  if (!post) return null;

  const readingTime = estimateReadingTime(post.content);
  const excerpt = getExcerpt(post.content, 240);
  const imageUrl = getImageUrl(post.thumbnail);
  const categorySlug = post.category_slug || post.category?.slug || 'tong-hop';
  const categoryName = post.category_name || post.category?.name || 'Tiêu điểm';
  const authorName = post.author_name || post.author?.full_name || 'Biên tập viên';
  const authorAvatar = getImageUrl(post.author_avatar || post.author?.avatar);

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-subtle)] mb-12 transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        {/* Story details */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between order-2 lg:order-1">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent)] bg-amber-500/10 px-2.5 py-0.5 rounded-[var(--radius-sm)] border border-amber-500/20">
                Tiêu điểm ban biên tập
              </span>
              <span className="text-[var(--color-text-muted)] text-xs">•</span>
              <Link
                href={`/category/${categorySlug}`}
                className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors"
              >
                {categoryName}
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--color-text-primary)] leading-[1.2] tracking-tight mb-4 hover:text-[var(--color-brand)] transition-colors">
              <Link href={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </h1>

            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed line-clamp-3 mb-6 font-normal">
              {excerpt}
            </p>
          </div>

          <div className="pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {authorAvatar ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
                  <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                  {authorName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-primary)] leading-tight">{authorName}</p>
                <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  <span>{formatVietnameseDate(post.published_at || post.created_at)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {readingTime} phút đọc
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-medium text-xs transition-colors group cursor-pointer shadow-xs"
            >
              <span>Đọc toàn văn</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[300px] lg:min-h-full bg-[var(--color-surface-muted)] order-1 lg:order-2 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              priority
              className="object-cover transition-transform duration-500 hover:scale-102"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
              <span className="font-bold text-sm tracking-wider uppercase">TechInsight Publication</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
