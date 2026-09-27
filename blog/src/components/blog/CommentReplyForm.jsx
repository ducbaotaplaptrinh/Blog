'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X, AlertCircle } from 'lucide-react';
import { postComment } from '@/lib/api';

export default function CommentReplyForm({
  postId,
  parentId,
  parentAuthorName,
  parentComment,
  onCancel,
  onSuccess,
}) {
  const effectiveParentId = parentId || parentComment?.id;
  const effectiveAuthorName =
    parentAuthorName ||
    parentComment?.username ||
    parentComment?.user_name ||
    parentComment?.guest_name ||
    'bình luận';

  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const textareaRef = useRef(null);

  // Load saved guest profile & auto-focus textarea
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('blog_reader_name');
      const savedEmail = localStorage.getItem('blog_reader_email');
      if (savedName) setGuestName(savedName);
      if (savedEmail) setGuestEmail(savedEmail);
    } catch (e) {}

    // Auto-focus with slight delay for render transition
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Escape key listener to cancel
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !guestName.trim()) {
      setErrorMsg('Vui lòng nhập họ tên và nội dung phản hồi.');
      return;
    }

    if (!guestEmail.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email để xác thực phản hồi.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail.trim())) {
      setErrorMsg('Địa chỉ email không đúng định dạng hợp lệ.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      try {
        localStorage.setItem('blog_reader_name', guestName.trim());
        localStorage.setItem('blog_reader_email', guestEmail.trim());
      } catch (e) {}

      await postComment({
        post_id: postId,
        content: content.trim(),
        parent_id: effectiveParentId,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
      });

      setContent('');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to submit reply:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-3.5 bg-[var(--color-surface)] rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-[var(--shadow-subtle)] space-y-3"
    >
      {/* Context Badge: Reply Target */}
      <div className="flex items-center justify-between text-xs text-[var(--color-brand)] bg-[var(--color-brand-light)] px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
        <span className="font-medium">
          ↳ Đang trả lời <strong>{effectiveAuthorName}</strong>
        </span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Hủy trả lời"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-0.5"
        >
          <X size={14} />
        </button>
      </div>

      {/* Guest Name & Email Inputs (compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-0.5">
            Tên của bạn <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Họ tên của bạn..."
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-brand)] text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-0.5">
            Email xác thực <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="email@example.com"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-brand)] text-[var(--color-text-primary)]"
          />
        </div>
      </div>

      {/* Textarea with auto-focus */}
      <div>
        <textarea
          ref={textareaRef}
          required
          rows={2}
          placeholder={`Viết phản hồi cho ${parentAuthorName}...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-label={`Nội dung phản hồi cho ${parentAuthorName}`}
          className="w-full px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-brand)] text-[var(--color-text-primary)] resize-none"
        />
      </div>

      {errorMsg && (
        <div className="p-2 rounded-[var(--radius-sm)] bg-rose-50 text-[var(--color-error)] dark:bg-rose-950/30 text-xs flex items-center gap-1.5">
          <AlertCircle size={13} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] text-xs font-medium transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] disabled:opacity-50 text-white text-xs font-semibold transition-colors"
        >
          <Send size={11} />
          <span>{submitting ? 'Đang gửi...' : 'Gửi trả lời'}</span>
        </button>
      </div>
    </form>
  );
}
