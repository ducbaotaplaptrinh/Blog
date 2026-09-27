import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getPublishedPosts } from '@/lib/api';
import { sanitizePostContent } from '@/lib/sanitize';
import { formatVietnameseDate, estimateReadingTime, getExcerpt, getImageUrl } from '@/lib/utils';
import PostCard from '@/components/blog/PostCard';
import LikeButton from '@/components/blog/LikeButton';
import ShareButtons from '@/components/blog/ShareButtons';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import ScrollTracker from '@/components/blog/ScrollTracker';
import CommentSection from '@/components/blog/CommentSection';
import { Calendar, Clock, Eye, ChevronRight } from 'lucide-react';

export const revalidate = 60; // Revalidate ISR 60 seconds

// Static generation helper
export async function generateStaticParams() {
  try {
    const res = await getPublishedPosts({ limit: 50 });
    const posts = res?.data || [];
    return posts.map((post) => ({ slug: post.slug }));
  } catch (err) {
    return [];
  }
}

// Dynamic SEO & Open Graph Metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await getPostBySlug(slug).catch(() => null);
  const post = res?.data;

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết',
    };
  }

  const excerpt = getExcerpt(post.content, 160);
  const imageUrl = getImageUrl(post.thumbnail);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: excerpt,
    keywords: [post.category_name, 'công nghệ', 'lập trình', post.title],
    authors: [{ name: post.author_name || 'TechInsight' }],
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: excerpt,
      url: postUrl,
      siteName: 'TechInsight Blog',
      locale: 'vi_VN',
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: [post.author_name || 'TechInsight'],
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function PostDetailPage({ params }) {
  const { slug } = await params;
  const res = await getPostBySlug(slug).catch(() => null);
  const post = res?.data;

  if (!post) {
    notFound();
  }

  const cleanContent = sanitizePostContent(post.content);
  const readingTime = estimateReadingTime(post.content);
  const excerpt = getExcerpt(post.content, 180);
  const imageUrl = getImageUrl(post.thumbnail);
  const authorAvatar = getImageUrl(post.author_avatar || post.author?.avatar);
  const authorName = post.author_name || post.author?.full_name || 'TechInsight Editor';
  const categorySlug = post.category_slug || post.category?.slug || 'tong-hop';
  const categoryName = post.category_name || post.category?.name || 'Chung';

  // Fetch related posts (same category)
  let relatedPosts = [];
  try {
    const relatedRes = await getPublishedPosts({ category: categorySlug, limit: 4 });
    relatedPosts = (relatedRes?.data || []).filter((p) => p.id !== post.id).slice(0, 3);
  } catch (e) {}

  // JSON-LD Structured Data Schema for Google
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: excerpt,
    image: imageUrl ? [imageUrl] : [],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechInsight Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  return (
    <article className="max-w-[720px] mx-auto space-y-8">
      {/* Scroll trackers & Progress bar */}
      <ReadingProgressBar />
      <ScrollTracker postId={post.id} />

      {/* JSON-LD Script injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Đường dẫn trang" className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] overflow-x-auto py-1 scrollbar-none">
        <Link href="/" className="hover:text-[var(--color-brand)] transition-colors whitespace-nowrap">
          Trang chủ
        </Link>
        <ChevronRight size={12} className="shrink-0 opacity-50" />
        <Link href="/blog" className="hover:text-[var(--color-brand)] transition-colors whitespace-nowrap">
          Blog
        </Link>
        <ChevronRight size={12} className="shrink-0 opacity-50" />
        <Link
          href={`/category/${categorySlug}`}
          className="hover:text-[var(--color-brand)] transition-colors whitespace-nowrap text-[var(--color-text-secondary)] font-medium"
        >
          {categoryName}
        </Link>
      </nav>

      {/* Post Header */}
      <header className="space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--color-text-primary)] leading-[1.25] tracking-tight">
          {post.title}
        </h1>

        {/* Metadata bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2.5">
            {authorAvatar ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--color-border)]">
                <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] flex items-center justify-center font-bold text-xs">
                {authorName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-[var(--color-text-primary)] leading-tight">{authorName}</p>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                <span>{formatVietnameseDate(post.published_at || post.created_at)}</span>
                <span>•</span>
                <span>{readingTime} phút đọc</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px]">
              <Eye size={13} />
              {post.views_count ?? post.views ?? 0} lượt xem
            </span>
          </div>
        </div>
      </header>

      {/* Featured Thumbnail */}
      {imageUrl && (
        <div className="relative aspect-[16/9] w-full rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-muted)] border border-[var(--color-border)] shadow-[var(--shadow-subtle)]">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        </div>
      )}

      {/* Post Body (Safe Sanitized HTML) with Editorial Typography */}
      <div
        className="prose-editorial"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />

      {/* Post Footer Actions */}
      <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
        <ShareButtons title={post.title} slug={post.slug} />
      </div>

      {/* Author Info Card */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 sm:p-6 flex items-start gap-4 border border-[var(--color-border)]">
        {authorAvatar ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
            <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-brand)] flex items-center justify-center font-bold text-lg shrink-0">
            {authorName.charAt(0)}
          </div>
        )}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              {authorName}
            </h4>
            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-[var(--radius-sm)] bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              Biên tập viên
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Đam mê kiến trúc phần mềm, chia sẻ kinh nghiệm phát triển hệ thống và giải pháp công nghệ hiện đại.
          </p>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-[var(--color-border)]">
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            Bài viết cùng chủ đề
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rel) => (
              <PostCard key={rel.id || rel.slug} post={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Comments Section */}
      <CommentSection postId={post.id} />
    </article>
  );
}
