import React, { useState } from 'react';
import {
  TrendingUp,
  Eye,
  MessageSquare,
  BarChart3,
  Award,
  Layers,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Filter,
  X,
  ExternalLink,
  Heart,
  Share2,
} from 'lucide-react';
import { useAnalyticsOverview, usePostReadDepth } from '../hooks/useAnalytics';

export const Analytics = () => {
  const { summary, popularPosts, categoryBreakdown, isLoading } = useAnalyticsOverview();
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Hook lấy chi tiết Read Depth cho modal
  const { data: readDepthDetail, isLoading: isLoadingDepth } = usePostReadDepth(selectedPostId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          Đang tải dữ liệu phân tích hiệu suất...
        </div>
      </div>
    );
  }

  // KPI Cards
  const kpiCards = [
    {
      label: 'Tổng Lượt Xem',
      value: Number(summary.total_views || 0).toLocaleString(),
      subtext: 'Trên toàn bộ bài viết đã xuất bản',
      icon: Eye,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
    },
    {
      label: 'Phiên Đọc Ghi Nhận',
      value: Number(summary.total_read_sessions || 0).toLocaleString(),
      subtext: 'Độc giả tương tác với nội dung',
      icon: BookOpen,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      label: 'Tỷ Lệ Đọc Hết (Read Depth)',
      value: `${summary.avg_completion_rate || 0}%`,
      subtext: `${Number(summary.total_completed_reads || 0).toLocaleString()} lượt đọc trọn vẹn (100%)`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'Tương Tác Độc Giả',
      value: `${Number(summary.total_likes || 0).toLocaleString()} Likes`,
      subtext: `${Number(summary.total_shares || 0).toLocaleString()} chia sẻ • ${Number(summary.total_comments || 0).toLocaleString()} bình luận`,
      icon: Heart,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <TrendingUp className="text-indigo-500 dark:text-indigo-400" size={32} />
          Hiệu Suất Nội Dung & Phân Tích (Analytics)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi mức độ tương tác, độ sâu bài đọc (Read Depth) và xu hướng nội dung của đội ngũ biên tập.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`glass-panel p-5 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 ${card.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2 Cột: Top bài viết đọc nhiều & Phân bổ theo danh mục */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 & 2: Top Popular Posts kèm Read Depth Completion Rate */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="text-amber-500 dark:text-amber-400" size={20} />
                Top Bài Viết Được Đọc Nhiều Nhất
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Xếp hạng theo lượt xem (Views) & tỷ lệ hoàn thành nội dung (Read Depth)
              </p>
            </div>
          </div>

          {popularPosts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              Chưa có dữ liệu bài viết đã xuất bản.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-3">HẠNG</th>
                    <th className="py-3 px-3">BÀI VIẾT</th>
                    <th className="py-3 px-3 text-center">LƯỢT XEM</th>
                    <th className="py-3 px-3 text-center">TƯƠNG TÁC</th>
                    <th className="py-3 px-3">TỶ LỆ ĐỌC HẾT</th>
                    <th className="py-3 px-3 text-right">CHI TIẾT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {popularPosts.map((post, index) => {
                    const completionRate = post.completion_rate || 0;
                    return (
                      <tr
                        key={post.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedPostId(post.id)}
                      >
                        <td className="py-3.5 px-3">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : index === 1
                                ? 'bg-slate-200 text-slate-700 dark:bg-slate-300/20 dark:text-slate-200 border border-slate-300/30'
                                : index === 2
                                ? 'bg-amber-700/20 text-amber-800 dark:text-amber-500 border border-amber-700/30'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 min-w-[220px]">
                          <div className="flex items-center gap-3">
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
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                                {post.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                  {post.category_name || 'Chưa phân loại'}
                                </span>
                                <span>•</span>
                                <span>Bởi {post.author_name || 'Admin'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {Number(post.views_count).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-center gap-2.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800/80 text-xs">
                            <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium" title="Lượt thích">
                              <Heart size={12} /> {post.likes_count || 0}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium" title="Bình luận">
                              <MessageSquare size={12} /> {post.comments_count || 0}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium" title="Lượt chia sẻ">
                              <Share2 size={12} /> {post.shares_count || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 min-w-[130px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-600 dark:text-slate-400">{completionRate}%</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {post.reached_100 || 0} lượt
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  completionRate >= 50
                                    ? 'bg-emerald-500'
                                    : completionRate >= 25
                                    ? 'bg-indigo-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(completionRate, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Xem phễu độ sâu đọc"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cột 3: Phân bổ bài viết theo danh mục (Category Breakdown) */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="text-indigo-500 dark:text-indigo-400" size={20} />
                Hiệu Suất Theo Danh Mục
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Tỷ trọng lượt xem và số bài viết được phân bổ trong từng chuyên mục
            </p>

            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">Chưa có danh mục nào.</p>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((cat) => {
                  const totalAllViews = Number(summary.total_views || 1);
                  const viewPercentage = Math.round(
                    (Number(cat.total_views || 0) / (totalAllViews || 1)) * 100
                  );
                  return (
                    <div key={cat.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-900 dark:text-white">{cat.name}</span>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {Number(cat.total_views).toLocaleString()} views
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(viewPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{cat.total_posts} bài viết</span>
                        <span>{cat.total_comments} thảo luận</span>
                        <span className="text-slate-400 dark:text-slate-500">{viewPercentage}% tổng lượt</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Chi tiết Read Depth / Scroll Funnel của một bài viết */}
      {selectedPostId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl p-6 relative border border-slate-200 dark:border-indigo-500/30 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedPostId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            {isLoadingDepth ? (
              <div className="py-12 flex justify-center items-center text-slate-500 dark:text-slate-400 gap-2">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                Đang tải phễu đọc...
              </div>
            ) : readDepthDetail ? (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full mb-2">
                    <BarChart3 size={13} />
                    Phễu Độ Sâu Đọc (Read Depth Funnel)
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {readDepthDetail.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Tổng lượt xem: <strong className="text-slate-900 dark:text-white">{readDepthDetail.views_count}</strong></span>
                    <span>•</span>
                    <span>Số phiên đọc: <strong className="text-slate-900 dark:text-white">{readDepthDetail.total_sessions}</strong></span>
                  </div>
                </div>

                {/* Funnel Progress Bars */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {/* 25% */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Cuộn 25% (Mở đầu & Tổng quan)</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {readDepthDetail.rate_25}% ({readDepthDetail.reached_25} phiên)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(readDepthDetail.rate_25 || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 50% */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Cuộn 50% (Nửa bài viết)</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {readDepthDetail.rate_50}% ({readDepthDetail.reached_50} phiên)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(readDepthDetail.rate_50 || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 75% */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Cuộn 75% (Đọc sâu nội dung)</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {readDepthDetail.rate_75}% ({readDepthDetail.reached_75} phiên)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(readDepthDetail.rate_75 || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 100% */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 size={13} /> Cuộn 100% (Đọc hoàn tất bài viết)
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {readDepthDetail.rate_100}% ({readDepthDetail.reached_100} phiên)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(readDepthDetail.rate_100 || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">💡 Gợi ý biên tập:</span>
                  <span>
                    Nếu tỷ lệ rơi rụng (drop-off) giữa mốc 25% và 50% quá cao, hãy cân nhắc đặt hình ảnh minh họa, bảng so sánh hoặc tóm tắt ý chính ở nửa đầu bài để giữ chân độc giả.
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedPostId(null)}
                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-transparent"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                Không tìm thấy dữ liệu độ sâu đọc cho bài viết này.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
