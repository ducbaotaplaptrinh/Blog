'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';

export default function ShareButtons({ title, slug }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://techinsight.vn/blog/${slug}`;

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mr-1 hidden sm:inline">
        Chia sẻ:
      </span>

      {/* Facebook Button */}
      <button
        onClick={shareFacebook}
        title="Chia sẻ lên Facebook"
        aria-label="Chia sẻ lên Facebook"
        className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#1877f2] hover:text-[#1877f2] text-[var(--color-text-secondary)] flex items-center justify-center transition-colors"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* X / Twitter Button */}
      <button
        onClick={shareTwitter}
        title="Chia sẻ lên X"
        aria-label="Chia sẻ lên X"
        className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-text-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-center transition-colors"
      >
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Copy Link Button */}
      <button
        onClick={copyToClipboard}
        title="Sao chép liên kết"
        aria-label="Sao chép liên kết bài viết"
        className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium flex items-center gap-1.5 transition-colors border ${
          copied
            ? 'bg-[var(--color-success)] text-white border-[var(--color-success)]'
            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]'
        }`}
      >
        {copied ? (
          <>
            <Check size={13} />
            <span>Đã chép</span>
          </>
        ) : (
          <>
            <Link2 size={13} />
            <span>Chép link</span>
          </>
        )}
      </button>
    </div>
  );
}
