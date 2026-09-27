'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, Search, Home, Layers, Info, Mail } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function MobileDrawer({ categories = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to custom event so BottomNav can also trigger opening this drawer
  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener('open-mobile-drawer', handleOpenEvent);
    return () => window.removeEventListener('open-mobile-drawer', handleOpenEvent);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle body scroll lock & escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Render Drawer Overlay & Panel directly into document.body via Portal
  // to avoid containing-block traps caused by backdrop-filter on <header>
  const drawerPortal = mounted ? createPortal(
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[100] transition-opacity duration-300 md:hidden ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 1. Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => setIsOpen(false)}
      />

      {/* 2. Slide-out Drawer Panel */}
      <aside
        className={`absolute top-0 right-0 h-dvh w-72 max-w-[85vw] bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out z-[101] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-brand)] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              T
            </div>
            <span className="font-extrabold text-base text-[var(--color-text-primary)]">
              TechInsight<span className="text-[var(--color-brand)]">.</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng menu điều hướng"
            className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation Links with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 overscroll-contain">
          <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-3 mb-2">
            Điều hướng
          </div>

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-[var(--color-brand-light)] text-[var(--color-brand)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Home size={17} />
            <span>Trang Chủ</span>
          </Link>

          <Link
            href="/blog"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
              pathname === '/blog'
                ? 'bg-[var(--color-brand-light)] text-[var(--color-brand)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <BookOpen size={17} />
            <span>Tất Cả Bài Viết</span>
          </Link>

          <Link
            href="/search"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
              pathname === '/search'
                ? 'bg-[var(--color-brand-light)] text-[var(--color-brand)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Search size={17} />
            <span>Tìm Kiếm Bài Viết</span>
          </Link>

          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
              pathname === '/about'
                ? 'bg-[var(--color-brand-light)] text-[var(--color-brand)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Info size={17} />
            <span>Về Chúng Tôi</span>
          </Link>

          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
              pathname === '/contact'
                ? 'bg-[var(--color-brand-light)] text-[var(--color-brand)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Mail size={17} />
            <span>Liên Hệ</span>
          </Link>

          {/* Categories List */}
          {categories.length > 0 && (
            <div className="pt-4 mt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-[var(--color-brand)]" />
                  Chuyên mục ({categories.length})
                </span>
              </div>
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id || cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 rounded-[var(--radius-md)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.post_count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] shrink-0">
                        {cat.post_count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Theme Toggle */}
        <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] shrink-0">
          <span className="font-medium text-[var(--color-text-secondary)]">Giao diện (Sáng / Tối)</span>
          <ThemeToggle />
        </div>
      </aside>
    </div>,
    document.body
  ) : null;

  return (
    <div className="md:hidden">
      {/* Hamburger Toggle Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Mở menu điều hướng"
        className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors border border-[var(--color-border)] cursor-pointer"
      >
        <Menu size={18} />
      </button>

      {/* Portal Container */}
      {drawerPortal}
    </div>
  );
}
