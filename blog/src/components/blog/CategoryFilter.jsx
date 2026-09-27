'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

export default function CategoryFilter({ categories = [], activeSlug = null }) {
  const pathname = usePathname();
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  return (
    <div className="relative w-full max-w-full min-w-0 flex items-center group/cat-slider">
      {/* Nút lùi về trước (Left Arrow) */}
      {!isBeginning && (
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Cuộn sang trái"
          className="absolute left-0 z-20 p-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:scale-105 transition-all cursor-pointer hidden sm:flex items-center justify-center -translate-x-1"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Swiper Slider */}
      <div className="w-full min-w-0 overflow-hidden px-1">
        <Swiper
          modules={[FreeMode, Mousewheel]}
          freeMode={{ enabled: true, momentum: true }}
          mousewheel={{ forceToAxis: true }}
          slidesPerView="auto"
          spaceBetween={8}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onReachBeginning={() => setIsBeginning(true)}
          onReachEnd={() => setIsEnd(true)}
          onFromEdge={() => {
            if (swiperRef.current) {
              setIsBeginning(swiperRef.current.isBeginning);
              setIsEnd(swiperRef.current.isEnd);
            }
          }}
          className="w-full py-1.5"
        >
          {/* Slide: Tất cả */}
          <SwiperSlide className="!w-auto">
            <Link
              href="/blog"
              className={`inline-block px-3.5 py-1.5 rounded-[var(--radius-full)] text-xs font-semibold whitespace-nowrap transition-colors border ${
                !activeSlug && pathname === '/blog'
                  ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white shadow-sm'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Tất cả
            </Link>
          </SwiperSlide>

          {/* Slides: Các danh mục */}
          {categories.map((cat) => {
            const isActive = activeSlug === cat.slug;
            return (
              <SwiperSlide key={cat.id || cat.slug} className="!w-auto">
                <Link
                  href={`/category/${cat.slug}`}
                  className={`inline-block px-3.5 py-1.5 rounded-[var(--radius-full)] text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isActive
                      ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white shadow-sm'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {cat.name}
                  {cat.post_count !== undefined && (
                    <span className="ml-1 opacity-70 text-[10px]">
                      ({cat.post_count})
                    </span>
                  )}
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Nút tiến về sau (Right Arrow) */}
      {!isEnd && (
        <button
          type="button"
          onClick={handleNext}
          aria-label="Cuộn sang phải"
          className="absolute right-0 z-20 p-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:scale-105 transition-all cursor-pointer hidden sm:flex items-center justify-center translate-x-1"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
