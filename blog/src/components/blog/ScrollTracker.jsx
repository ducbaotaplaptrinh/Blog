'use client';

import { useEffect, useRef } from 'react';
import { trackReadDepth } from '@/lib/api';

export default function ScrollTracker({ postId }) {
  const trackedMilestones = useRef(new Set());

  useEffect(() => {
    if (!postId) return;

    const calculateDepth = () => {
      const scrollTop = window.scrollY;
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const totalScrollable = docHeight - winHeight;

      if (totalScrollable <= 0) return;

      const percentage = Math.round((scrollTop / totalScrollable) * 100);

      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (percentage >= m && !trackedMilestones.current.has(m)) {
          trackedMilestones.current.add(m);
          // Send beacon / analytics event
          trackReadDepth(postId, m);
        }
      }
    };

    window.addEventListener('scroll', calculateDepth, { passive: true });
    return () => window.removeEventListener('scroll', calculateDepth);
  }, [postId]);

  return null;
}
