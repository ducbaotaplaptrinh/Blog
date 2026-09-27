import Link from 'next/link';
import Image from 'next/image';
import { formatVietnameseDate, estimateReadingTime, getExcerpt, getImageUrl } from '@/lib/utils';
import { Clock, Eye } from 'lucide-react';

export default function PostCard({ post, priority = false }) {
  if (!post) return null;

  const readingTime = estimateReadingTime(post.content);
  const excerpt = getExcerpt(post.content, 130);
  const imageUrl = getImageUrl(post.thumbnail);
  const categorySlug = post.category_slug || (post.category?.slug) || 'tong-hop';
  const categoryName = post.category_name || (post.category?.name) || 'Chuyên mục';
  const authorName = post.author_name || post.author?.full_name || 'Tác giả';
  const authorAvatar = getImageUrl(post.author_avatar || post.author?.avatar);

  return (
    <article className="group flex flex-col h-full bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-floating)] transition-all duration-200 overflow-hidden">
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-surface-muted)] block">
        <Link href={`/blog/${post.slug}`} className="absolute inset-0 block" aria-label={post.title}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.title || 'Ảnh bài viết'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-102"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
              <span className="font-semibold text-xs tracking-wider uppercase">TechInsight</span>
            </div>
          )}
        </Link>
      </div>

      {/* Card Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Category Chip above Title */}
          <div className="mb-2.5">
            <Link
              href={`/category/${categorySlug}`}
              className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] hover:underline"
            >
              {categoryName}
            </Link>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors line-clamp-2 leading-snug mb-2.5">
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed mb-4">
            {excerpt}
          </p>
        </div>

        {/* Card Footer: Author + Metadata */}
        <div className="pt-3.5 mt-auto border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2 min-w-0">
            {authorAvatar ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[var(--color-border)]">
                <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] flex items-center justify-center shrink-0 text-[10px] font-bold">
                {authorName.charAt(0)}
              </div>
            )}
            <span className="text-xs font-medium text-[var(--color-text-secondary)] truncate">
              {authorName}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 tabular-nums">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {readingTime}p
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={11} />
              {post.views_count ?? post.views ?? 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
