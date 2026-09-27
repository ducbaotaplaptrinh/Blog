'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { likePost } from '@/lib/api';

export default function LikeButton({ postId, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
      if (likedPosts.includes(postId)) {
        setIsLiked(true);
      }
    } catch (e) {}
  }, [postId]);

  const handleLike = async () => {
    if (isLiked || loading) return;

    setLoading(true);
    setLikes((prev) => prev + 1);
    setIsLiked(true);

    try {
      const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
      if (!likedPosts.includes(postId)) {
        likedPosts.push(postId);
        localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
      }

      await likePost(postId);
    } catch (err) {
      console.warn('Like request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLiked || loading}
      aria-label={isLiked ? 'Đã thích bài viết này' : 'Thích bài viết này'}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] text-xs font-semibold transition-colors border ${
        isLiked
          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900 cursor-default'
          : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-500'
      }`}
    >
      <Heart size={14} className={isLiked ? 'fill-current text-rose-500' : ''} />
      <span>{likes} Thích</span>
    </button>
  );
}
