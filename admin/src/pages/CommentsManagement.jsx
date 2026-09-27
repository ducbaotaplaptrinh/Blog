import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  User,
  FileText,
  Clock,
  Trash2,
  CornerDownRight,
  CheckCircle2,
  EyeOff,
  AlertTriangle,
  Layers,
  ListFilter,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import {
  useComments,
  useCommentStats,
  usePendingComments,
  usePostCommentGroups,
  useUpdateCommentStatus,
  useDeleteComment,
} from '../hooks/useComments';
import { Button } from '../components/ui/Button/Button';
import { ThreadInspectorDrawer } from '../components/comments/ThreadInspectorDrawer';

export const CommentsManagement = () => {
  // State for active tab: 'queue' | 'by-post' | 'all'
  const [activeTab, setActiveTab] = useState('queue');

  // Drawer state for inspecting full conversation tree of a post
  const [threadDrawer, setThreadDrawer] = useState({
    isOpen: false,
    postId: null,
    postTitle: '',
    postSlug: '',
    highlightCommentId: null,
  });

  // Queries
  const { stats, isLoading: isStatsLoading } = useCommentStats();
  const { updateStatus, isUpdating } = useUpdateCommentStatus();
  const { deleteComment, isDeleting } = useDeleteComment();

  // Tab 1: Action Queue Query
  const [queuePage, setQueuePage] = useState(1);
  const {
    comments: pendingComments,
    total: pendingTotal,
    isLoading: isQueueLoading,
  } = usePendingComments({ page: queuePage, limit: 15 });

  // Tab 2: Group by Post Query
  const [postSearch, setPostSearch] = useState('');
  const [postPage, setPostPage] = useState(1);
  const {
    posts: postGroups,
    total: postGroupsTotal,
    isLoading: isPostGroupsLoading,
  } = usePostCommentGroups({ search: postSearch, page: postPage, limit: 10 });

  // Tab 3: All Comments Query
  const [allSearch, setAllSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [allPage, setAllPage] = useState(1);
  const {
    comments: allComments,
    total: allTotal,
    isLoading: isAllLoading,
  } = useComments({
    search: allSearch,
    status: statusFilter || undefined,
    page: allPage,
    limit: 20,
  });

  const handleOpenThread = (item) => {
    // Luôn phân giải chính xác post_id bất kể truyền vào comment hay post group
    const resolvedPostId = item.post_id || item.id;
    const resolvedPostTitle = item.post_title || item.title || 'Bài viết';
    const resolvedPostSlug = item.post_slug || item.slug || '';
    // Nếu đối tượng mở là một comment (có post_id) -> truyền ID comment để highlight
    const targetCommentId = item.post_id ? item.id : null;

    setThreadDrawer({
      isOpen: true,
      postId: resolvedPostId,
      postTitle: resolvedPostTitle,
      postSlug: resolvedPostSlug,
      highlightCommentId: targetCommentId,
    });
  };

  const handleStatusChange = (id, newStatus) => {
    updateStatus({ id, status: newStatus });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này khỏi hệ thống?')) {
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
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
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

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={30} />
            Kiểm Duyệt Bình Luận
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Quản lý hội thoại độc giả, kiểm duyệt nội dung chờ phê duyệt và theo dõi mức độ tương tác theo bài viết.
          </p>
        </div>
      </div>

      {/* 2. Top KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Tổng bình luận</span>
            <MessageSquare size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats.total?.toLocaleString() ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Toàn bộ trên hệ thống</span>
        </div>

        <div className={`glass-panel p-4 flex flex-col justify-between border-l-4 ${stats.pending > 0 ? 'border-l-amber-500 bg-amber-500/5' : 'border-l-slate-300 dark:border-l-slate-700'}`}>
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <span>Cần xử lý</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {stats.pending?.toLocaleString() ?? 0}
          </p>
          <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">
            {stats.pending > 0 ? 'Bình luận đang chờ duyệt' : 'Hàng chờ sạch sẽ'}
          </span>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Đã duyệt công khai</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.approved?.toLocaleString() ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Hiển thị cho độc giả</span>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Đã ẩn</span>
            <EyeOff size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {stats.hidden?.toLocaleString() ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Nội dung bị ẩn</span>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Hôm nay</span>
            <Flame size={16} className="text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">
            +{stats.today_count?.toLocaleString() ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Tương tác trong ngày</span>
        </div>
      </div>

      {/* 3. Segmented Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto pb-0">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'queue'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <AlertTriangle size={16} />
          <span>Cần xử lý</span>
          {stats.pending > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold animate-pulse">
              {stats.pending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('by-post')}
          className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'by-post'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Layers size={16} />
          <span>Theo bài viết</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <ListFilter size={16} />
          <span>Tất cả & Tra cứu</span>
        </button>
      </div>

      {/* 4. Tab 1: Action Queue (Cần xử lý) */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Hàng đợi kiểm duyệt ({pendingTotal} bình luận)
            </h3>
            <span className="text-xs text-slate-400">
              Ưu tiên xử lý các phản hồi đang ở trạng thái Chờ duyệt hoặc Đã ẩn
            </span>
          </div>

          {isQueueLoading ? (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-slate-500">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              Đang tải hàng đợi kiểm duyệt...
            </div>
          ) : pendingComments.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500 dark:text-slate-400">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500" />
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Không có bình luận nào cần kiểm duyệt!
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Tất cả các bình luận độc giả gửi đến đã được xử lý hoặc phê duyệt tự động.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-xl border transition-all glass-panel ${
                    comment.status === 'pending'
                      ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {comment.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {comment.username}
                          </span>
                          {comment.email && (
                            <span className="text-xs text-slate-400 hidden sm:inline">({comment.email})</span>
                          )}
                          {getStatusBadge(comment.status)}
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(comment.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenThread(comment)}
                        className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Mở toàn bộ cây hội thoại bài viết"
                      >
                        <MessageSquare size={13} />
                        <span>Xem luồng</span>
                      </button>

                      {comment.status !== 'approved' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                          className="px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Phê duyệt cho bình luận hiển thị trên Blog"
                        >
                          <CheckCircle2 size={13} />
                          <span>Duyệt</span>
                        </button>
                      )}

                      {comment.status !== 'hidden' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(comment.id, 'hidden')}
                          className="px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Ẩn bình luận"
                        >
                          <EyeOff size={13} />
                          <span>Ẩn</span>
                        </button>
                      )}

                      <button
                        disabled={isDeleting}
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Comment text */}
                  <div className="py-3">
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white/70 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                      "{comment.content}"
                    </p>
                  </div>

                  {/* Footer link to post */}
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5 truncate">
                      <CornerDownRight size={13} className="text-indigo-500 shrink-0" />
                      <span>Bài viết:</span>
                      <strong className="text-slate-800 dark:text-slate-200 truncate font-medium">
                        {comment.post_title}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Group by Post (Theo bài viết) */}
      {activeTab === 'by-post' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm bài viết có bình luận..."
                value={postSearch}
                onChange={(e) => {
                  setPostSearch(e.target.value);
                  setPostPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="text-xs text-slate-500 self-start sm:self-auto">
              Tìm thấy <strong className="text-slate-900 dark:text-white">{postGroupsTotal}</strong> bài viết có thảo luận
            </div>
          </div>

          {isPostGroupsLoading ? (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-slate-500">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              Đang tải danh sách bài viết...
            </div>
          ) : postGroups.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500">
              <FileText size={36} className="mx-auto mb-2 opacity-40" />
              Không tìm thấy bài viết nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postGroups.map((post) => (
                <div
                  key={post.post_id}
                  className="glass-panel p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
                >
                  <div>
                    {/* Top: Category & Pending Alert */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                        {post.category_name || 'Chung'}
                      </span>
                      {post.pending_comments > 0 && (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={11} /> {post.pending_comments} chờ duyệt
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {post.post_title}
                    </h4>

                    {/* Stats pills */}
                    <div className="flex items-center gap-2 text-xs mt-3 flex-wrap">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-medium">
                        Tổng: <strong>{post.total_comments}</strong>
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md font-medium">
                        Đã duyệt: <strong>{post.approved_comments}</strong>
                      </span>
                      {post.hidden_comments > 0 && (
                        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md font-medium">
                          Đã ẩn: <strong>{post.hidden_comments}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action & Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {post.last_comment_at ? new Date(post.last_comment_at).toLocaleDateString('vi-VN') : 'Mới'}
                    </span>
                    <button
                      onClick={() => handleOpenThread(post)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <MessageSquare size={13} />
                      <span>Xem luồng ({post.total_comments})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {postGroupsTotal > 10 && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                disabled={postPage <= 1}
                onClick={() => setPostPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 text-xs"
              >
                <ChevronLeft size={14} /> Trước
              </Button>
              <span className="text-xs text-slate-500 px-2">
                Trang {postPage} / {Math.ceil(postGroupsTotal / 10)}
              </span>
              <Button
                variant="secondary"
                disabled={postPage >= Math.ceil(postGroupsTotal / 10)}
                onClick={() => setPostPage((p) => p + 1)}
                className="px-2.5 py-1 text-xs"
              >
                Sau <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Tất cả bình luận (All Comments & Filter) */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo nội dung, user, bài viết..."
                  value={allSearch}
                  onChange={(e) => {
                    setAllSearch(e.target.value);
                    setAllPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setAllPage(1);
                }}
                aria-label="Lọc theo trạng thái"
                className="w-full sm:w-44 py-2 px-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="approved">Đã duyệt (Approved)</option>
                <option value="pending">Chờ duyệt (Pending)</option>
                <option value="hidden">Đã ẩn (Hidden)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 self-start sm:self-auto">
              Hiển thị <strong className="text-slate-900 dark:text-white">{allComments.length}</strong> / {allTotal} bình luận
            </div>
          </div>

          {isAllLoading ? (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-slate-500">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              Đang tải danh sách bình luận...
            </div>
          ) : allComments.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500">
              <MessageSquare size={36} className="mx-auto mb-2 opacity-40" />
              Không tìm thấy bình luận nào thỏa mãn bộ lọc.
            </div>
          ) : (
            <div className="space-y-3">
              {allComments.map((comment) => (
                <div
                  key={comment.id}
                  className="glass-panel p-4 rounded-xl border transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-sky-600 dark:text-sky-400">
                        {comment.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {comment.username}
                          </span>
                          <span className="text-[11px] text-slate-400">({comment.email})</span>
                          {getStatusBadge(comment.status)}
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(comment.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenThread(comment)}
                        className="px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xem vị trí trong hội thoại"
                      >
                        <MessageSquare size={12} /> Luồng
                      </button>

                      {comment.status !== 'approved' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                          className="px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 rounded border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 size={12} /> Duyệt
                        </button>
                      )}

                      {comment.status !== 'hidden' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(comment.id, 'hidden')}
                          className="px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 rounded border border-rose-200 dark:border-rose-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <EyeOff size={12} /> Ẩn
                        </button>
                      )}

                      <button
                        disabled={isDeleting}
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="py-2.5">
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      "{comment.content}"
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50">
                    <CornerDownRight size={12} className="text-indigo-500 shrink-0" />
                    <span>Tại bài:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-medium truncate">
                      {comment.post_title}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {allTotal > 20 && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                disabled={allPage <= 1}
                onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 text-xs"
              >
                <ChevronLeft size={14} /> Trước
              </Button>
              <span className="text-xs text-slate-500 px-2">
                Trang {allPage} / {Math.ceil(allTotal / 20)}
              </span>
              <Button
                variant="secondary"
                disabled={allPage >= Math.ceil(allTotal / 20)}
                onClick={() => setAllPage((p) => p + 1)}
                className="px-2.5 py-1 text-xs"
              >
                Sau <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 7. Thread Inspector Drawer */}
      <ThreadInspectorDrawer
        isOpen={threadDrawer.isOpen}
        onClose={() => setThreadDrawer({ isOpen: false, postId: null, postTitle: '', postSlug: '', highlightCommentId: null })}
        postId={threadDrawer.postId}
        postTitle={threadDrawer.postTitle}
        postSlug={threadDrawer.postSlug}
        highlightCommentId={threadDrawer.highlightCommentId}
      />
    </div>
  );
};
