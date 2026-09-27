'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  Calendar,
  Search,
  RotateCcw,
  SlidersHorizontal,
  X,
  Flame,
  Clock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới nhất', icon: Clock },
  { id: 'views_desc', label: 'Xem nhiều nhất', icon: Flame },
  { id: 'comments_desc', label: 'Thảo luận nhiều', icon: MessageSquare },
  { id: 'oldest', label: 'Cũ nhất', icon: Sparkles },
];

const TIME_OPTIONS = [
  { id: 'all', label: 'Toàn thời gian' },
  { id: 'week', label: '7 ngày qua' },
  { id: 'month', label: '30 ngày qua' },
  { id: 'year', label: 'Năm nay' },
];

export default function BlogFilterBar({
  totalPosts = 0,
  categories = [],
  lockedCategory = null, // Khi ở trang /category/[slug], không cho đổi category
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get('sort') || 'newest';
  const currentTime = searchParams.get('time') || 'all';
  const currentCategory = lockedCategory || searchParams.get('category') || '';
  const currentSearch = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Cập nhật URL Query Params
  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'all' || (key === 'sort' && value === 'newest')) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Luôn reset về trang 1 khi đổi bộ lọc
    params.delete('page');

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(newUrl, { scroll: false });
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQuery({ q: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateQuery({ q: '' });
  };

  const handleResetAll = () => {
    setSearchInput('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    (currentSort && currentSort !== 'newest') ||
    (currentTime && currentTime !== 'all') ||
    (!lockedCategory && currentCategory) ||
    currentSearch
  );

  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);

  return (
    <div className="space-y-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-subtle)] transition-all">
      {/* Top Row: Search + Sort + Time */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tiêu đề, từ khóa kỹ thuật..."
            className="w-full pl-9 pr-16 py-2 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand)] transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              aria-label="Xóa từ khóa"
            >
              <X size={13} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--color-brand)] text-white text-[11px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Tìm
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Category Dropdown (Chỉ hiện khi không ở trang category slug) */}
          {!lockedCategory && categories.length > 0 && (
            <div className="relative min-w-[130px] flex-1 sm:flex-initial">
              <select
                value={currentCategory}
                onChange={(e) => updateQuery({ category: e.target.value })}
                className="w-full pl-3 pr-7 py-2 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-xs font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] transition-colors cursor-pointer appearance-none"
              >
                <option value="">Tất cả chuyên mục</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <SlidersHorizontal
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
            </div>
          )}

          {/* Time Filter Dropdown */}
          <div className="relative min-w-[130px] flex-1 sm:flex-initial">
            <select
              value={currentTime}
              onChange={(e) => updateQuery({ time: e.target.value })}
              className="w-full pl-7 pr-7 py-2 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-xs font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] transition-colors cursor-pointer appearance-none"
            >
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Calendar
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
            />
            <ArrowUpDown
              size={11}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
            />
          </div>

          {/* Sort Selector Dropdown */}
          <div className="relative min-w-[145px] flex-1 sm:flex-initial">
            <select
              value={currentSort}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="w-full pl-7 pr-7 py-2 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-xs font-semibold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] transition-colors cursor-pointer appearance-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-brand)] pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Active filter tags & Total Results */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span>
            Tìm thấy{' '}
            <strong className="text-[var(--color-text-primary)] font-semibold">
              {totalPosts}
            </strong>{' '}
            bài viết
          </span>

          {/* Filter Badges */}
          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              Từ khóa: &ldquo;{currentSearch}&rdquo;
              <button
                onClick={handleClearSearch}
                className="hover:text-[var(--color-error)] cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {!lockedCategory && currentCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-brand-light)] border border-[var(--color-brand)] text-[var(--color-brand)] font-medium">
              Chủ đề: {activeCategoryObj?.name || currentCategory}
              <button
                onClick={() => updateQuery({ category: '' })}
                className="hover:opacity-70 cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {currentTime !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              Thời gian: {TIME_OPTIONS.find((t) => t.id === currentTime)?.label}
              <button
                onClick={() => updateQuery({ time: 'all' })}
                className="hover:text-[var(--color-error)] cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {currentSort !== 'newest' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              Sắp xếp: {SORT_OPTIONS.find((s) => s.id === currentSort)?.label}
              <button
                onClick={() => updateQuery({ sort: 'newest' })}
                className="hover:text-[var(--color-error)] cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline font-semibold cursor-pointer ml-auto"
          >
            <RotateCcw size={11} />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      {isPending && (
        <div className="h-0.5 w-full bg-[var(--color-border)] overflow-hidden rounded-full">
          <div className="h-full bg-[var(--color-brand)] animate-pulse w-1/2"></div>
        </div>
      )}
    </div>
  );
}
