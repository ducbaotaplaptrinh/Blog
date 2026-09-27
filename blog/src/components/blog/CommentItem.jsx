'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Reply, CornerDownRight, ChevronDown, ChevronUp } from 'lucide-react';
import { formatVietnameseDate, getImageUrl } from '@/lib/utils';
import { countTotalReplies } from '@/lib/commentTree';
import CommentReplyForm from './CommentReplyForm';

export default function CommentItem({
  comment,
  postId,
  depth = 0,
  activeReplyId,
  onOpenReply,
  onCloseReply,
  onReplySuccess,
}) {
  const authorName = comment.username || comment.user_name || comment.guest_name || 'Độc giả';
  const avatarUrl = getImageUrl(comment.avatar || comment.user_avatar);
  const userRole = comment.role || comment.user_role;
  const isReplying = activeReplyId === comment.id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const totalRepliesCount = countTotalReplies(comment);

  // Depth-based collapsing rule:
  // - Depth >= 2 (Tầng 3 trở đi): Luôn luôn mặc định thu gọn (collapsed)
  // - Replies >= 3: Mặc định thu gọn
  // - Depth < 2 và <= 2 replies: Mặc định mở sẵn
  const initialExpanded = depth < 2 && (comment.replies?.length || 0) <= 2;
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // Tự động mở rộng danh sách khi người dùng bấm Trả lời comment này
  useEffect(() => {
    if (isReplying) {
      setIsExpanded(true);
    }
  }, [isReplying]);

  const handleReplySuccess = () => {
    setIsExpanded(true);
    onReplySuccess?.();
  };

  // Mobile-safe indentation limit:
  // depth 0: no margin/border
  // depth 1: pl-3 sm:pl-5 border-l-2 border-[var(--color-border)] ml-2 sm:ml-4
  // depth 2+: same indentation as depth 1 to prevent squishing text on 375px mobile screens
  const indentClass =
    depth === 0
      ? ''
      : depth === 1
      ? 'pl-3 sm:pl-5 border-l-2 border-[var(--color-border)] ml-2 sm:ml-4'
      : 'pl-2.5 sm:pl-4 border-l-2 border-[var(--color-border)] ml-1 sm:ml-2';

  return (
    <div className={`space-y-3 ${indentClass}`} id={`comment-${comment.id}`}>
      {/* Comment Card */}
      <div
        className={`p-3.5 sm:p-4 rounded-[var(--radius-lg)] border transition-colors ${
          depth === 0
            ? 'bg-[var(--color-surface)] border-[var(--color-border)] shadow-[var(--shadow-subtle)]'
            : 'bg-[var(--color-surface-muted)] border-[var(--color-border)]'
        }`}
      >
        {/* Header: Avatar, Name, Role badge, Timestamp & Reply button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
                <Image
                  src={avatarUrl}
                  alt={authorName}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
                  {authorName}
                </span>

                {userRole && userRole !== 'user' && (
                  <span
                    className={`px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-semibold ${
                      userRole === 'admin'
                        ? 'bg-[var(--color-brand)] text-white'
                        : 'bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                    }`}
                  >
                    {userRole === 'admin' ? 'Quản trị viên' : 'Tác giả'}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-[var(--color-text-muted)] block mt-0.5">
                {formatVietnameseDate(comment.created_at)}
              </span>
            </div>
          </div>

          {/* Reply Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (isReplying) {
                onCloseReply();
              } else {
                onOpenReply(comment.id);
              }
            }}
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-[var(--radius-md)] font-medium transition-all ${
              isReplying
                ? 'bg-[var(--color-brand)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)]'
            }`}
            title={`Trả lời ${authorName}`}
          >
            <Reply size={12} className={isReplying ? 'rotate-180' : ''} />
            <span>{isReplying ? 'Đóng lại' : 'Trả lời'}</span>
          </button>
        </div>

        {/* Comment Body */}
        <div className="mt-2.5 pl-9 sm:pl-10 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </div>
      </div>

      {/* Inline Reply Form (Rendered directly beneath target comment) */}
      {isReplying && (
        <div className="pl-6 sm:pl-8 pt-1">
          <div className="relative">
            <CornerDownRight
              size={14}
              className="absolute -left-5 top-4 text-[var(--color-brand)]"
            />
            <CommentReplyForm
              postId={postId}
              parentComment={comment}
              onCancel={onCloseReply}
              onSuccess={handleReplySuccess}
            />
          </div>
        </div>
      )}

      {/* Collapsible / Expandable Child Replies */}
      {hasReplies && (
        <div className="space-y-3 pt-1">
          {!isExpanded ? (
            /* Toggle button to expand replies */
            <div className="pl-3 sm:pl-5">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface)] px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-[var(--shadow-subtle)] transition-all cursor-pointer"
              >
                <ChevronDown size={14} />
                <span>
                  Xem {totalRepliesCount} phản hồi{depth >= 2 ? ' lồng nhau' : ''}
                </span>
              </button>
            </div>
          ) : (
            /* Expanded replies list */
            <div className="space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                  activeReplyId={activeReplyId}
                  onOpenReply={onOpenReply}
                  onCloseReply={onCloseReply}
                  onReplySuccess={onReplySuccess}
                />
              ))}

              {/* Button to collapse replies back */}
              <div className="pt-1 pl-3 sm:pl-5">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors cursor-pointer"
                >
                  <ChevronUp size={13} />
                  <span>Thu gọn {totalRepliesCount} phản hồi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
