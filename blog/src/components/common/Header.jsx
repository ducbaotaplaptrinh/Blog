import Link from 'next/link';
import { Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import MobileDrawer from './MobileDrawer';

export default function Header({ categories = [] }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--color-surface)]/90 border-b border-[var(--color-border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-brand)] flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-102">
            T
          </div>
          <span className="font-extrabold text-base tracking-tight text-[var(--color-text-primary)]">
            TechInsight<span className="text-[var(--color-brand)]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)]">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-[var(--radius-md)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            Trang Chủ
          </Link>
          <Link
            href="/blog"
            className="px-3.5 py-1.5 rounded-[var(--radius-md)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            Bài Viết
          </Link>
          <Link
            href="/about"
            className="px-3.5 py-1.5 rounded-[var(--radius-md)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            Về Chúng Tôi
          </Link>
          <Link
            href="/contact"
            className="px-3.5 py-1.5 rounded-[var(--radius-md)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            Liên Hệ
          </Link>
        </nav>

        {/* Right Tools: Search Button, Theme Toggle & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Quick Search Link */}
          <Link
            href="/search"
            aria-label="Tìm kiếm bài viết"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-border)]/50 rounded-[var(--radius-md)] border border-[var(--color-border)] transition-colors"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Tìm kiếm...</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-[var(--color-surface)] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-muted)]">
              /
            </kbd>
          </Link>

          {/* Desktop Theme Toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Mobile Drawer */}
          <MobileDrawer categories={categories} />
        </div>
      </div>
    </header>
  );
}
