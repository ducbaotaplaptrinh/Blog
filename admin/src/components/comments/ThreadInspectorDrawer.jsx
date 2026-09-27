import React, { useEffect } from 'react';
import { X, CornerDownRight, CheckCircle2, EyeOff, Trash2, Clock, ExternalLink, MessageSquare, Star } from 'lucide-react';
import { useAdminPostComments, useUpdateCommentStatus, useDeleteComment } from '../../hooks/useComments';
import { Button } from '../ui/Button/Button';

export const ThreadInspectorDrawer = ({ postId, postTitle, postSlug, isOpen, onClose, highlightCommentId }) => {
  const { comments, isLoading } = useAdminPostComments(postId);
  const { updateStatus, isUpdating } = useUpdateCommentStatus();
  const { deleteComment, isDeleting } = useDeleteComment();

  // Lắng nghe phím Escape để đóng Drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tự động cuộn đến bình luận được chọn để kiểm duyệt
  useEffect(() => {
    if (highlightCommentId && !isLoading && comments.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`comment-node-${highlightCommentId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [highlightCommentId, isLoading, comments]);

  if (!isOpen) return null;

  // Build recursive tree from flat comments
  const buildTree = (items) => {
    const map = {};
    const roots = [];
    items.forEach((item) => {
      map[item.id] = { ...item, replies: [] };
    });
    items.forEach((item) => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].replies.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });
    return roots;
  };

  const commentTree = buildTree(comments);

  const handleStatusChange = (id, newStatus) => {
    updateStatus({ id, status: newStatus });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này? (Nếu có câu trả lời con, câu trả lời con sẽ bị xóa hoặc mồ côi)')) {
      deleteComment(id);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ✓ Đã duyệt
          </span>
        );
      case 'pending':
        return (
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
            ⏳ Chờ duyệt
          </span>
        );
      case 'hidden':
        return (
          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            ✕ Đã ẩn
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  // Recursive item renderer
  const renderCommentItem = (node, depth = 0) => {
    const isReply = depth > 0;
    const isHighlighted = highlightCommentId && Number(node.id) === Number(highlightCommentId);

    return (
      <div
        key={node.id}
        id={`comment-node-${node.id}`}
        className={`relative transition-all duration-300 ${
          isReply ? 'mt-3 pl-3 sm:pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/50' : 'mt-4'
        }`}
      >
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isHighlighted
              ? 'ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/15 border-indigo-400 dark:border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/30'
              : node.status === 'pending'
              ? 'bg-amber-500/5 border-amber-300 dark:border-amber-700/60'
              : node.status === 'hidden'
              ? 'bg-rose-500/5 border-rose-300 dark:border-rose-700/60 opacity-80'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                {node.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {node.username}
                  </span>
                  {node.role && node.role !== 'user' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium uppercase">
                      {node.role}
                    </span>
                  )}
                  {node.reply_to_username && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <CornerDownRight size={11} className="text-indigo-500" />
                      hồi đáp <strong className="text-indigo-600 dark:text-indigo-400">@{node.reply_to_username}</strong>
                    </span>
                  )}
                  {isHighlighted && (
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded border border-indigo-300 dark:border-indigo-700 flex items-center gap-1">
                      <Star size={10} className="fill-indigo-500" /> Mục tiêu xem luồng
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(node.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {getStatusBadge(node.status)}
            </div>
          </div>

          {/* Body */}
          <div className="py-2.5">
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words whitespace-pre-line">
              {node.content}
            </p>
          </div>

          {/* Quick Moderation Actions */}
          <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
            {node.status !== 'approved' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange(node.id, 'approved')}
                className="px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded flex items-center gap-1 transition-colors cursor-pointer"
                title="Duyệt hiển thị công khai"
              >
                <CheckCircle2 size={12} /> Duyệt
              </button>
            )}

            {node.status !== 'hidden' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange(node.id, 'hidden')}
                className="px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded flex items-center gap-1 transition-colors cursor-pointer"
                title="Ẩn bình luận khỏi public blog"
              >
                <EyeOff size={12} /> Ẩn
              </button>
            )}

            <button
              type="button"
              disabled={isDeleting}
              onClick={() => handleDelete(node.id)}
              className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded flex items-center gap-1 transition-colors cursor-pointer"
              title="Xóa vĩnh viễn"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Recursive Nested Replies */}
        {node.replies && node.replies.length > 0 && (
          <div className="space-y-1">
            {node.replies.map((reply) => renderCommentItem(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 cursor-pointer"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 cursor-default"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <MessageSquare size={14} />
              Luồng Hội Thoại Bình Luận
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate mt-0.5" title={postTitle}>
              {postTitle}
            </h2>
            {postSlug && (
              <a
                href={`http://localhost:3000/blog/${postSlug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mt-0.5 transition-colors"
              >
                <span>Xem trên trang Blog công khai</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body: Comments Tree */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800/60">
            <span>Tổng cộng: <strong className="text-slate-900 dark:text-white">{comments.length}</strong> bình luận</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đã duyệt</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Chờ duyệt</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Đã ẩn</span>
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Đang tải toàn bộ luồng hội thoại...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
              Chưa có bình luận nào cho bài viết này.
            </div>
          ) : (
            <div className="space-y-3 pb-8">
              {commentTree.map((rootNode) => renderCommentItem(rootNode, 0))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <Button variant="secondary" onClick={onClose} className="px-4 py-2 text-xs">
            Đóng bảng kiểm duyệt
          </Button>
        </div>
      </div>
    </div>
  );
};
