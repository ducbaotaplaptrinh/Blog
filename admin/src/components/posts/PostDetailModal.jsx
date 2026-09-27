import React from 'react';
import { Modal } from '../ui/Modal/Modal';
import { usePostComments, useDeleteComment } from '../../hooks/useComments';
import {
  FileText,
  Calendar,
  User,
  Folder,
  Eye,
  MessageSquare,
  Clock,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export const PostDetailModal = ({ post, isOpen, onClose }) => {
  const postId = post?.id;
  const { comments, isLoading: isCommentsLoading } = usePostComments(postId);
  const { deleteComment, isDeleting } = useDeleteComment();

  if (!post) return null;

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này khỏi bài viết?')) {
      deleteComment(commentId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi Tiết Bài Viết & Bình Luận Độc Giả"
    >
      <div className="space-y-6">
        {/* Thông tin bài viết */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4">
          <div className="flex gap-4">
            {post.thumbnail ? (
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-24 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-24 h-20 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 shrink-0">
                Không có ảnh
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                {post.category_name || 'Chưa phân loại'}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                {post.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {post.summary || 'Không có tóm tắt.'}
              </p>
            </div>
          </div>

          {/* Metadata badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 truncate">
              <User size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{post.views_count} lượt xem</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong className="text-slate-900 dark:text-white">{comments.length}</strong> bình luận
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách bình luận thuộc về bài viết này */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-500 dark:text-emerald-400" />
              Danh Sách Bình Luận ({comments.length})
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Quản lý phản hồi trực tiếp cho bài viết này
            </span>
          </div>

          {isCommentsLoading ? (
            <div className="flex items-center justify-center py-6 text-slate-500 dark:text-slate-400 text-xs">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Đang tải bình luận bài viết...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              Bài viết này hiện chưa có bình luận nào.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 hover:border-slate-300 dark:hover:border-slate-700/80 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-sky-600 dark:text-sky-400">
                        {comment.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{comment.username}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">({comment.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Đã đăng
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-950/60 p-2.5 rounded border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                    {comment.content}
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={isDeleting}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 p-1 hover:bg-red-500/10 rounded cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} /> Xóa bình luận này
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
