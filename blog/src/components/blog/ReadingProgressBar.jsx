'use client';

import { useState, useEffect } from 'react';

export default function ReadingProgressBar() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setCompletion(Number((currentProgress / scrollHeight).toFixed(3)) * 100);
      }
    };

    window.addEventListener('scroll', updateScrollCompletion, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollCompletion);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 h-[2.5px] bg-[var(--color-brand)] z-50 transition-all duration-100 ease-out"
      style={{ width: `${completion}%` }}
    />
  );
}
