import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import {
  Users,
  FileText,
  FolderTree,
  MessageSquare,
  ArrowRight,
  Eye,
  Calendar,
  User,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  CheckCircle2,
  Hourglass,
  FileEdit,
  XCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const DashboardOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, recentPosts, recentComments, recentUsers, isLoading } = useAdminDashboard();
  const [activityTab, setActivityTab] = useState('comments'); // 'comments' | 'users'

  // Thời gian & lời chào thời gian thực
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const currentDateFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Trợ giúp hiển thị badge trạng thái bài viết
  const renderPostStatusBadge = (status, isPublished) => {
    const effectiveStatus = status || (isPublished ? 'published' : 'draft');
    switch (effectiveStatus) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Đã xuất bản
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Chờ duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle size={11} />
            Bị từ chối
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <FileEdit size={11} />
            Bản nháp
          </span>
        );
    }
  };

  // Trợ giúp hiển thị badge trạng thái bình luận
  const renderCommentStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Đã duyệt
          </span>
        );
      case 'pending':
        return (
          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded animate-pulse">
            Chờ duyệt
          </span>
        );
      case 'hidden':
        return (
          <span className="text-[10px] font-medium text-slate-500 bg-slate-500/10 px-1.5 py-0.5 rounded">
            Đã ẩn
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Đã duyệt
          </span>
        );
    }
  };

  // Trợ giúp hiển thị vai trò người dùng
  const renderUserRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
            {role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        );
      case 'editor':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            Editor
          </span>
        );
      case 'author':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            Author
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Reader
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-slate-200 dark:bg-slate-800/60 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800"></div>
        </div>
      </div>
    );
  }

  const hasPendingItems = (stats?.pendingPosts || 0) > 0 || (stats?.pendingComments || 0) > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Editorial Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
            <Sparkles size={13} />
            <span>TechInsight Editorial Mission Control</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {user?.username || 'Ban Quản Trị'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize flex items-center gap-2">
            <span>{currentDateFormatted}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Hệ thống xuất bản sẵn sàng
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/posts')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Soạn Bài Viết Mới</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            title="Xem báo cáo chi tiết"
          >
            <TrendingUp size={16} />
            <span className="hidden sm:inline">Phân Tích</span>
          </button>
        </div>
      </div>

      {/* 2. Action Required Hub (Báo động hàng đợi biên tập) */}
      {hasPendingItems && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertCircle size={22} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                Hàng Đợi Biên Tập Cần Xử Lý
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono font-bold">
                  {(stats.pendingPosts || 0) + (stats.pendingComments || 0)}
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-600 dark:text-slate-300">
                {(stats.pendingPosts || 0) > 0 && (
                  <span className="flex items-center gap-1 font-medium">
                    <Hourglass size={13} className="text-amber-500" />
                    <strong>{stats.pendingPosts}</strong> bài viết đang chờ phê duyệt nội dung
                  </span>
                )}
                {(stats.pendingComments || 0) > 0 && (
                  <span className="flex items-center gap-1 font-medium">
                    <MessageSquare size={13} className="text-indigo-400" />
                    <strong>{stats.pendingComments}</strong> bình luận mới của độc giả cần kiểm duyệt
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            {(stats.pendingPosts || 0) > 0 && (
              <button
                onClick={() => navigate('/posts')}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Duyệt Bài Viết →
              </button>
            )}
            {(stats.pendingComments || 0) > 0 && (
              <button
                onClick={() => navigate('/comments')}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                Kiểm Duyệt Bình Luận →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Editorial Vital Signs Grid (4 Khối Chỉ Số Chuẩn Editorial - Hairline & font-mono) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Publishing Velocity */}
        <div
          onClick={() => navigate('/posts')}
          className="glass-panel p-5 cursor-pointer transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md group relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider">Xuất Bản Nội Dung</span>
            <FileText size={16} className="text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              {stats.publishedPosts ?? stats.totalPosts}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Đã xuất bản
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{stats.draftPosts || 0} bản nháp đang soạn</span>
            <span>{stats.totalCategories} danh mục</span>
          </div>
        </div>

        {/* Metric 2: Editorial Pipeline (Hàng đợi kiểm duyệt) */}
        <div
          onClick={() => navigate((stats.pendingPosts || 0) > 0 ? '/posts' : '/comments')}
          className={`glass-panel p-5 cursor-pointer transition-all duration-200 hover:shadow-md group relative overflow-hidden ${
            (stats.pendingPosts || 0) > 0
              ? 'border-amber-500/40 bg-amber-500/[0.02]'
              : 'hover:border-indigo-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider">Hàng Đợi Kiểm Duyệt</span>
            <Hourglass size={16} className={`${(stats.pendingPosts || 0) > 0 ? 'text-amber-500' : 'text-slate-400'} group-hover:scale-110 transition-transform`} />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              {stats.pendingPosts || 0}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              (stats.pendingPosts || 0) > 0
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              Bài chờ duyệt
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{stats.pendingComments || 0} bình luận chờ</span>
            <span className="text-indigo-500 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Xử lý <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* Metric 3: Community Vitality */}
        <div
          onClick={() => navigate('/comments')}
          className="glass-panel p-5 cursor-pointer transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md group relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider">Cộng Đồng & Thảo Luận</span>
            <MessageSquare size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              {stats.totalComments}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Bình luận
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{stats.totalUsers} thành viên</span>
            <span>{stats.totalLikes || 0} lượt thích</span>
          </div>
        </div>

        {/* Metric 4: Read Vitality & Depth */}
        <div
          onClick={() => navigate('/analytics')}
          className="glass-panel p-5 cursor-pointer transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md group relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider">Sức Khỏe Đọc Bài</span>
            <TrendingUp size={16} className="text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              {Number(stats.totalViews || 0).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
              Lượt xem
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Đọc hết (100%): <strong className="text-slate-700 dark:text-slate-300 font-mono">{stats.avgCompletionRate || 0}%</strong></span>
            <span className="text-indigo-500 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Chi tiết <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* 4. Split Command Deck: Luồng Bài Viết (62%) & Dòng Hoạt Động (38%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (7 cols / ~58%): Luồng Bài Viết & Tiến Trình Biên Tập */}
        <div className="lg:col-span-7 glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-indigo-500" />
                  Tiến Trình Biên Tập & Bài Viết Mới Nhất
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Theo dõi trạng thái xuất bản, kiểm duyệt và phản hồi của độc giả
                </p>
              </div>
              <button
                onClick={() => navigate('/posts')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer transition-colors"
              >
                Xem tất cả ({stats.totalPosts}) <ArrowRight size={13} />
              </button>
            </div>

            {recentPosts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                Chưa có bài viết nào được tạo.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate('/posts')}
                    className="py-3.5 flex items-start sm:items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-14 h-11 object-cover rounded-md border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-11 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                          No pic
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {post.title}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {post.author_name || 'Admin'}
                          </span>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {post.category_name || 'Chưa phân loại'}
                          </span>
                          <span>•</span>
                          <span className="font-mono tabular-nums flex items-center gap-1">
                            <Eye size={12} /> {post.views_count}
                          </span>
                          <span>•</span>
                          <span className="font-mono tabular-nums flex items-center gap-1">
                            <MessageSquare size={12} /> {post.comments_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                      {renderPostStatusBadge(post.status, post.is_published)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Hiển thị {recentPosts.length} bài viết mới cập nhật gần đây</span>
            <button
              onClick={() => navigate('/posts')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Mở trang Quản Lý Bài Viết →
            </button>
          </div>
        </div>

        {/* CỘT PHẢI (5 cols / ~42%): Dòng Hoạt Động (Comments & Users) */}
        <div className="lg:col-span-5 glass-panel p-6 flex flex-col justify-between">
          <div>
            {/* Tab Header Selector */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActivityTab('comments')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    activityTab === 'comments'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Bình Luận Mới ({recentComments.length})
                </button>
                <button
                  onClick={() => setActivityTab('users')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    activityTab === 'users'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Thành Viên ({recentUsers.length})
                </button>
              </div>

              <button
                onClick={() => navigate(activityTab === 'comments' ? '/comments' : '/users')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium flex items-center gap-0.5"
              >
                Tất cả <ArrowRight size={12} />
              </button>
            </div>

            {/* TAB CONTENT: BÌNH LUẬN MỚI */}
            {activityTab === 'comments' && (
              <div>
                {recentComments.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                    Chưa có bình luận nào.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {recentComments.map((comment) => (
                      <div
                        key={comment.id}
                        onClick={() => navigate('/comments')}
                        className="py-3 group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                              {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
                            </span>
                            {comment.username}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {renderCommentStatusBadge(comment.status)}
                            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                              {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-200/80 dark:border-slate-800/60">
                          "{comment.content}"
                        </p>

                        <p className="text-[11px] text-slate-500 mt-1.5 truncate">
                          Tại: <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">{comment.post_title}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: THÀNH VIÊN MỚI */}
            {activityTab === 'users' && (
              <div>
                {recentUsers.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                    Chưa có thành viên nào.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {recentUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => navigate('/users')}
                        className="py-3 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                              {u.username}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {renderUserRoleBadge(u.role)}
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                            {new Date(u.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <button
              onClick={() => navigate(activityTab === 'comments' ? '/comments' : '/users')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Quản lý toàn bộ {activityTab === 'comments' ? 'Bình Luận' : 'Người Dùng'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
