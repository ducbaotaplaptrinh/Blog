import Link from 'next/link';
import { getPublishedPosts } from '@/lib/api';
import PostCard from '@/components/blog/PostCard';
import { Search as SearchIcon, BookOpen, Sparkles } from 'lucide-react';
import Form from 'next/form';

export const metadata = {
  title: 'Tìm kiếm bài viết',
  description: 'Tìm kiếm nội dung bài viết và chủ đề công nghệ trên TechInsight Blog.',
};

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q?.trim() || '';

  const suggestedTopics = [
    'Next.js',
    'React 19',
    'PostgreSQL',
    'System Design',
    'Docker',
    'Microservices',
    'Bảo mật API',
    'Tree Shaking',
  ];

  let posts = [];
  if (query) {
    try {
      const res = await getPublishedPosts({ search: query, limit: 15 });
      posts = res?.data || [];
    } catch (e) {
      posts = [];
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Search Header Form */}
      <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent)] bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
          Tra cứu tri thức
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
          Tìm kiếm bài viết & chủ đề
        </h1>
        <p className="text-[var(--color-text-secondary)] text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Nhập từ khóa kỹ thuật, tên công nghệ hoặc khái niệm kiến trúc bạn đang quan tâm để khám phá các bài viết liên quan.
        </p>

        <Form action="/search" className="relative mt-6 max-w-xl mx-auto">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Ví dụ: Next.js App Router, Docker, Clean Architecture..."
            className="w-full pl-11 pr-28 py-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-brand)] text-xs sm:text-sm outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] shadow-[var(--shadow-subtle)] transition-colors"
          />
          <SearchIcon size={18} className="text-[var(--color-text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Tìm kiếm
          </button>
        </Form>

        {/* Quick Suggested Topics */}
        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1 text-[11px] font-medium shrink-0">
            <Sparkles size={12} className="text-[var(--color-accent)]" /> Gợi ý:
          </span>
          {suggestedTopics.map((topic) => (
            <Link
              key={topic}
              href={`/search?q=${encodeURIComponent(topic)}`}
              className="px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-[11px] transition-colors border border-[var(--color-border)]"
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>

      {/* Query Status */}
      {query && (
        <div className="pb-3 border-b border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span>
            Kết quả tra cứu cho: &quot;<strong className="text-[var(--color-text-primary)]">{query}</strong>&quot;
          </span>
          <span className="font-semibold text-[var(--color-brand)]">{posts.length} bài viết</span>
        </div>
      )}

      {/* Search Results Grid */}
      {query ? (
        posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id || post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-8">
            <BookOpen size={40} className="text-[var(--color-text-muted)] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              Không tìm thấy bài viết nào
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 max-w-sm mx-auto leading-relaxed">
              Không có bài viết nào khớp với từ khóa &quot;{query}&quot;. Bạn hãy thử tìm với các từ khóa công nghệ phổ biến ở phần gợi ý phía trên.
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-16 text-[var(--color-text-muted)] text-xs border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] p-8">
          Chọn một gợi ý ở trên hoặc nhập từ khóa để xem danh sách bài viết chuyên sâu.
        </div>
      )}
    </div>
  );
}
