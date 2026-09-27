'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Search, Layers } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const handleOpenMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-mobile-drawer'));
    }
  };

  const navItems = [
    {
      label: 'Trang Chủ',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Bài Viết',
      href: '/blog',
      icon: BookOpen,
      isActive: pathname.startsWith('/blog'),
    },
    {
      label: 'Tìm Kiếm',
      href: '/search',
      icon: Search,
      isActive: pathname === '/search',
    },
  ];

  const isCategoryActive = pathname.startsWith('/category');

  return (
    <nav
      aria-label="Thanh điều hướng di động"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors"
    >
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 rounded-[var(--radius-md)] transition-all cursor-pointer ${
                item.isActive
                  ? 'text-[var(--color-brand)] font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <div className="relative">
                <Icon size={19} strokeWidth={item.isActive ? 2.3 : 1.8} />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-brand)]" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* 4th Action: Open Menu & Categories Drawer */}
        <button
          type="button"
          onClick={handleOpenMenu}
          aria-label="Mở danh mục & menu"
          className={`flex flex-col items-center justify-center py-1 rounded-[var(--radius-md)] transition-all cursor-pointer ${
            isCategoryActive
              ? 'text-[var(--color-brand)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <div className="relative">
            <Layers size={19} strokeWidth={isCategoryActive ? 2.3 : 1.8} />
            {isCategoryActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-brand)]" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Chủ Đề</span>
        </button>
      </div>
    </nav>
  );
}
