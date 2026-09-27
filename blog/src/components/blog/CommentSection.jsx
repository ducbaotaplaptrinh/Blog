'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCommentsByPostId, postComment } from '@/lib/api';
import { buildCommentTree } from '@/lib/commentTree';
import CommentItem from './CommentItem';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);

  // Root form state
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Load existing reader profile from localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('blog_reader_name');
      const savedEmail = localStorage.getItem('blog_reader_email');
      if (savedName) setGuestName(savedName);
      if (savedEmail) setGuestEmail(savedEmail);
    } catch (e) {}
  }, []);

  // Fetch comments on mount / postId change
  useEffect(() => {
    if (!postId) return;
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await getCommentsByPostId(postId);
      setComments(res?.data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Convert flat array into nested tree
  const commentTree = useMemo(() => {
    return buildCommentTree(comments);
  }, [comments]);

  const handleRootSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !guestName.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập họ tên và nội dung bình luận.' });
      return;
    }

    if (!guestEmail.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập địa chỉ email để xác thực bình luận.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail.trim())) {
      setStatusMsg({ type: 'error', text: 'Địa chỉ email không đúng định dạng hợp lệ.' });
      return;
    }

    try {
      setSubmitting(true);
      setStatusMsg({ type: '', text: '' });

      // Save reader info
      try {
        localStorage.setItem('blog_reader_name', guestName.trim());
        localStorage.setItem('blog_reader_email', guestEmail.trim());
      } catch (e) {}

      await postComment({
        post_id: postId,
        content: content.trim(),
        parent_id: null,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
      });

      setContent('');
      setStatusMsg({
        type: 'success',
        text: 'Bình luận của bạn đã được gửi và đang chờ ban biên tập phê duyệt trước khi hiển thị công khai.',
      });

      await loadComments();
    } catch (err) {
      console.error('Error posting root comment:', err);
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReply = (commentId) => {
    setActiveReplyId(commentId);
  };

  const handleCloseReply = () => {
    setActiveReplyId(null);
  };

  const handleReplySuccess = async () => {
    setActiveReplyId(null);
    setStatusMsg({
      type: 'success',
      text: 'Phản hồi của bạn đã được gửi và đang chờ ban biên tập phê duyệt.',
    });
    await loadComments();
  };

  return (
    <div className="pt-8 border-t border-[var(--color-border)] space-y-6" id="comments">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <MessageSquare size={18} className="text-[var(--color-brand)]" />
          <span>Bình luận ({comments.length})</span>
        </h3>
      </div>

      {/* Root Submission Form */}
      <form
        onSubmit={handleRootSubmit}
        className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-[var(--shadow-subtle)] space-y-3.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Để lại bình luận mới
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)] italic">
            * Bình luận sẽ được ban biên tập kiểm duyệt trước khi hiển thị
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Họ tên của bạn <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn A"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-brand)] text-[var(--color-text-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Email xác thực <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="email@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-brand)] text-[var(--color-text-primary)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
            Nội dung bình luận <span className="text-[var(--color-error)]">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Chia sẻ quan điểm hoặc đặt câu hỏi về bài viết..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-brand)] text-[var(--color-text-primary)] resize-none"
          />
        </div>

        {statusMsg.text && (
          <div
            className={`p-2.5 rounded-[var(--radius-md)] text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-[var(--color-surface-muted)] text-[var(--color-success)] border border-[var(--color-border)]'
                : 'bg-rose-50 text-[var(--color-error)] dark:bg-rose-950/30'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 size={14} className="shrink-0" />
            ) : (
              <AlertCircle size={14} className="shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] disabled:opacity-50 text-white font-medium text-xs transition-colors"
          >
            <Send size={12} />
            <span>{submitting ? 'Đang gửi...' : 'Gửi bình luận'}</span>
          </button>
        </div>
      </form>

      {/* Threaded Comment Tree */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-[var(--color-surface-muted)] rounded-[var(--radius-md)]"
            />
          ))}
        </div>
      ) : commentTree.length > 0 ? (
        <div className="space-y-4 pt-2">
          {commentTree.map((rootComment) => (
            <CommentItem
              key={rootComment.id}
              comment={rootComment}
              postId={postId}
              depth={0}
              activeReplyId={activeReplyId}
              onOpenReply={handleOpenReply}
              onCloseReply={handleCloseReply}
              onReplySuccess={handleReplySuccess}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-text-muted)] italic text-center py-6 bg-[var(--color-surface-muted)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!
        </p>
      )}
    </div>
  );
}
