import React, { useState, useEffect } from 'react';
import {
  usePosts,
  usePostStats,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useSubmitPost,
  useApprovePost,
  useRejectPost,
} from '../hooks/usePosts';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button/Button';
import { Modal } from '../components/ui/Modal/Modal';
import { PostForm } from '../components/posts/PostForm';
import { PostDetailModal } from '../components/posts/PostDetailModal';
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  AlertCircle,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const PostsManagement = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all'); // 'all' | 'pending' | 'published' | 'rejected' | 'draft'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('newest'); // 'newest' | 'oldest' | 'views_desc' | 'comments_desc'
  const [timePreset, setTimePreset] = useState('all'); // 'all' | 'today' | '7days' | '30days' | 'this_month' | 'custom'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [rejectingPost, setRejectingPost] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const isAuthor = user?.role === 'author';
  const isEditorOrAdmin = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'editor';

  // Debounce tìm kiếm 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Xử lý chuyển đổi Preset thời gian
  const handleTimePresetChange = (preset) => {
    setTimePreset(preset);
    setPage(1);
    const now = new Date();
    const toISOStringDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else if (preset === 'today') {
      const todayStr = toISOStringDate(now);
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === '7days') {
      const past = new Date(Date.now() - 7 * 86400000);
      setDateFrom(toISOStringDate(past));
      setDateTo(toISOStringDate(now));
    } else if (preset === '30days') {
      const past = new Date(Date.now() - 30 * 86400000);
      setDateFrom(toISOStringDate(past));
      setDateTo(toISOStringDate(now));
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setDateFrom(toISOStringDate(firstDay));
      setDateTo(toISOStringDate(now));
    }
  };

  const hasActiveFilters = Boolean(
    search ||
    selectedCategory ||
    timePreset !== 'all' ||
    dateFrom ||
    dateTo ||
    sort !== 'newest'
  );

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setTimePreset('all');
    setDateFrom('');
    setDateTo('');
    setSort('newest');
    setPage(1);
  };

  // Tham số truy vấn backend
  const queryParams = {
    page,
    limit,
    sort,
    ...(selectedStatusTab !== 'all' ? { status: selectedStatusTab } : {}),
    ...(selectedCategory ? { category_id: selectedCategory } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
    ...(isAuthor ? { author_id: user?.id } : {}),
  };

  const { posts, pagination, isLoading: isPostsLoading } = usePosts(queryParams);
  const { categories } = useCategories();
  const { stats } = usePostStats();

  const { createPost, isCreating } = useCreatePost({
    onSuccess: () => {
      setIsPostModalOpen(false);
      setEditingPost(null);
    },
  });

  const { updatePost, isUpdating } = useUpdatePost({
    onSuccess: () => {
      setIsPostModalOpen(false);
      setEditingPost(null);
    },
  });

  const { deletePost, isDeleting } = useDeletePost();
  const { submitPost, isSubmitting } = useSubmitPost();
  const { approvePost, isApproving } = useApprovePost();
  const { rejectPost, isRejecting } = useRejectPost();

  const handleOpenCreatePost = () => {
    setEditingPost(null);
    setIsPostModalOpen(true);
  };

  const handleOpenEditPost = (post) => {
    setEditingPost(post);
    setIsPostModalOpen(true);
  };

  const handleSavePost = (formData) => {
    if (editingPost) {
      updatePost({ id: editingPost.id, data: formData });
    } else {
      createPost(formData);
    }
  };

  const handleDeletePost = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này? Tất cả bình luận liên quan cũng sẽ bị xóa.')) {
      deletePost(id);
    }
  };

  const handleSubmitForReview = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn gửi bài viết này đến Ban biên tập để xét duyệt?')) {
      submitPost(id);
    }
  };

  const handleApprove = (id) => {
    if (window.confirm('Xác nhận phê duyệt và xuất bản bài viết này lên trang chủ?')) {
      approvePost(id);
    }
  };

  const handleOpenRejectModal = (post) => {
    setRejectingPost(post);
    setRejectReason('');
  };

  const statusTabs = [
    { id: 'all', label: 'Tất cả bài viết', count: stats?.total ?? pagination.total },
    { id: 'pending', label: 'Chờ duyệt', count: stats?.pending ?? 0, highlight: (stats?.pending ?? 0) > 0 },
    { id: 'published', label: 'Đã xuất bản', count: stats?.published ?? 0 },
    { id: 'rejected', label: 'Bị từ chối', count: stats?.rejected ?? 0 },
    { id: 'draft', label: 'Bản nháp', count: stats?.draft ?? 0 },
  ];

  const getStatusBadge = (status, rejectionReason) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Đã xuất bản
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
            <Clock size={11} />
            Chờ duyệt
          </span>
        );
      case 'rejected':
        return (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 cursor-help"
            title={rejectionReason ? `Lý do: ${rejectionReason}` : 'Bị từ chối'}
          >
            <AlertCircle size={11} />
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Bản nháp
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isAuthor ? 'Bài Viết Của Tôi' : 'Quản Lý Bài Viết'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {isAuthor
              ? 'Tạo bản thảo, theo dõi trạng thái phê duyệt và chỉnh sửa bài viết của bạn'
              : 'Kiểm duyệt bài viết của tác giả, xuất bản và giám sát bình luận độc giả'}
          </p>
        </div>
        <Button onClick={handleOpenCreatePost}>
          <Plus size={18} /> Thêm Bài Viết Mới
        </Button>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel p-6">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800/80">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatusTab(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedStatusTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedStatusTab === tab.id
                    ? 'bg-indigo-700 text-white'
                    : tab.highlight
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter & Sort Toolbar */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input (4 cols) */}
            <div className="lg:col-span-4 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, tác giả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:border-indigo-500 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter (3 cols) */}
            <div className="lg:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="">Tất cả chuyên mục</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Filter Preset (2 cols) */}
            <div className="lg:col-span-2">
              <div className="relative">
                <select
                  value={timePreset}
                  onChange={(e) => handleTimePresetChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="all">Toàn thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="this_month">Tháng này</option>
                  <option value="custom">Tùy chỉnh ngày...</option>
                </select>
                <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort Dropdown & Reset (3 cols) */}
            <div className="lg:col-span-3 flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 transition-colors cursor-pointer font-medium"
                >
                  <option value="newest">Mới nhất (Ngày đăng)</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="views_desc">Nhiều lượt xem nhất</option>
                  <option value="comments_desc">Nhiều bình luận nhất</option>
                </select>
                <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">Đặt lại</span>
                </button>
              )}
            </div>
          </div>

          {/* Custom Date Pickers */}
          {timePreset === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs animate-fadeIn">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar size={13} className="text-indigo-500" /> Chọn khoảng thời gian:
              </span>
              <div className="flex items-center gap-2">
                <label className="text-slate-500">Từ ngày:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-slate-500">Đến ngày:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500 cursor-pointer"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setPage(1);
                  }}
                  className="text-xs text-rose-500 hover:underline cursor-pointer ml-auto"
                >
                  Xóa mốc ngày
                </button>
              )}
            </div>
          )}
        </div>

        {/* List Count Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <FileText size={16} className="text-indigo-500" />
            <span>Danh Sách Bài Viết ({pagination.total})</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Hiển thị mỗi trang:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded text-xs outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {isPostsLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Đang tải danh sách bài viết...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleResetFilters} className="mt-3 text-xs">
                <RotateCcw size={13} className="mr-1" /> Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                  <th className="py-3 px-4">ẢNH</th>
                  <th className="py-3 px-4">TIÊU ĐỀ & NGÀY</th>
                  <th className="py-3 px-4">TRẠNG THÁI</th>
                  <th className="py-3 px-4">DANH MỤC</th>
                  <th className="py-3 px-4">TÁC GIẢ</th>
                  <th className="py-3 px-4 text-center">LƯỢT XEM</th>
                  <th className="py-3 px-4 text-center">BÌNH LUẬN</th>
                  <th className="py-3 px-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-12 h-10 object-cover rounded border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-10 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                          No pic
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white max-w-xs">
                      <div className="truncate font-semibold">{post.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} className="text-slate-400" />
                        <span>
                          {post.published_at
                            ? `Xuất bản: ${new Date(post.published_at).toLocaleDateString('vi-VN')}`
                            : `Tạo lúc: ${new Date(post.created_at).toLocaleDateString('vi-VN')}`}
                        </span>
                      </div>
                      {post.status === 'rejected' && post.rejection_reason && (
                        <p className="text-[11px] text-red-500 dark:text-red-400 truncate mt-0.5">
                          Lý do: {post.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(post.status, post.rejection_reason)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      <span className="text-xs bg-indigo-50 dark:bg-slate-800/80 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700">
                        {post.category_name || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{post.author_name}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={12} className="text-slate-400" /> {post.views_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        <MessageSquare size={12} /> {post.comments_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* 1. Nút Xem chi tiết */}
                        <Button
                          variant="outline"
                          onClick={() => setViewingPost(post)}
                          className="px-2 py-1 text-xs"
                          title="Xem chi tiết & bình luận"
                        >
                          <Eye size={13} className="text-indigo-400" />
                        </Button>

                        {/* 2. Hành động Duyệt / Từ chối cho Editor & Super Admin */}
                        {isEditorOrAdmin && post.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(post.id)}
                              disabled={isApproving}
                              className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              title="Phê duyệt bài viết"
                            >
                              <CheckCircle size={13} /> Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRejectModal(post)}
                              disabled={isRejecting}
                              className="px-2 py-1 text-xs bg-red-600/80 hover:bg-red-500 text-white rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              title="Từ chối bài viết"
                            >
                              <XCircle size={13} /> Từ chối
                            </button>
                          </>
                        )}

                        {/* 3. Hành động Gửi duyệt cho Author khi bài là draft hoặc rejected */}
                        {isAuthor && (post.status === 'draft' || post.status === 'rejected') && (
                          <button
                            type="button"
                            onClick={() => handleSubmitForReview(post.id)}
                            disabled={isSubmitting}
                            className="px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            title="Gửi bài để Ban biên tập duyệt"
                          >
                            <Send size={12} /> Gửi duyệt
                          </button>
                        )}

                        {/* 4. Nút Sửa: Chỉ cho phép Author sửa nếu draft/rejected. Editor/Admin sửa được mọi bài. */}
                        {(!isAuthor || post.status === 'draft' || post.status === 'rejected') && (
                          <Button
                            variant="outline"
                            onClick={() => handleOpenEditPost(post)}
                            className="px-2 py-1 text-xs"
                            title="Chỉnh sửa bài viết"
                          >
                            <Pencil size={13} /> Sửa
                          </Button>
                        )}

                        {/* 5. Nút Xóa: Author chỉ xóa được draft. Editor/Admin xóa được bài. */}
                        {(!isAuthor || post.status === 'draft') && (
                          <Button
                            variant="danger"
                            onClick={() => handleDeletePost(post.id)}
                            disabled={isDeleting}
                            className="px-2 py-1 text-xs"
                            title="Xóa bài viết"
                          >
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Hiển thị <span className="font-semibold text-slate-800 dark:text-slate-200">{(page - 1) * limit + 1}</span> - <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min(page * limit, pagination.total)}</span> trong tổng số <span className="font-semibold text-slate-800 dark:text-slate-200">{pagination.total}</span> bài viết
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} /> Trước
              </button>

              <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-200">
                Trang {page} / {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tạo/Sửa Bài Viết */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingPost(null);
        }}
        title={editingPost ? 'Chỉnh Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
      >
        <PostForm
          onSubmit={handleSavePost}
          categories={categories}
          loading={isCreating || isUpdating}
          initialData={editingPost}
        />
      </Modal>

      {/* Modal Xem Chi Tiết Bài Viết & Quản Lý Bình Luận */}
      <PostDetailModal
        post={viewingPost}
        isOpen={!!viewingPost}
        onClose={() => setViewingPost(null)}
      />

      {/* Modal Từ Chối Bài Viết Kèm Lý Do */}
      <Modal
        isOpen={!!rejectingPost}
        onClose={() => {
          setRejectingPost(null);
          setRejectReason('');
        }}
        title="Từ Chối Phê Duyệt Bài Viết"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bạn đang từ chối bài viết: <strong className="text-slate-800 dark:text-slate-100">{rejectingPost?.title}</strong>
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Lý do từ chối <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Cần bổ sung ví dụ thực tế ở phần 2 và trích dẫn nguồn tài liệu tham khảo..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lý do này sẽ hiển thị trực tiếp cho tác giả để họ chỉnh sửa và nộp duyệt lại.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectingPost(null);
                setRejectReason('');
              }}
              disabled={isRejecting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              disabled={isRejecting || !rejectReason.trim()}
              onClick={() => {
                if (rejectingPost && rejectReason.trim()) {
                  rejectPost(
                    { id: rejectingPost.id, reason: rejectReason.trim() },
                    {
                      onSuccess: () => {
                        setRejectingPost(null);
                        setRejectReason('');
                      },
                    }
                  );
                }
              }}
            >
              {isRejecting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
