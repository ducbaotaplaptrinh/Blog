import React, { useState } from 'react';
import { 
  useNewsletterSubscribers, useNewsletterStats, 
  useNewsletterDeliveries, useUnsubscribeSubscriber, useDeleteSubscriber 
} from '../hooks/useNewsletter';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button/Button';
import { 
  Send, Users, MailCheck, UserMinus, Clock, 
  Search, ChevronLeft, ChevronRight, RefreshCw, 
  Trash2, ShieldAlert, CheckCircle2, AlertCircle, FileText, ExternalLink 
} from 'lucide-react';

export const NewsletterManagement = () => {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState('subscribers'); // 'subscribers' | 'deliveries'
  const [subscriberStatusTab, setSubscriberStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useNewsletterStats();
  const { subscribers, pagination, isLoading: isSubscribersLoading, refetch: refetchSubscribers } = useNewsletterSubscribers({
    status: subscriberStatusTab,
    search,
    page,
    limit: 10,
  });

  const { deliveries, isLoading: isDeliveriesLoading, refetch: refetchDeliveries } = useNewsletterDeliveries({
    page: 1,
    limit: 15,
  });

  const unsubscribeMutation = useUnsubscribeSubscriber();
  const deleteMutation = useDeleteSubscriber();

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const stats = statsData || {
    total_subscribers: 0,
    active_subscribers: 0,
    unsubscribed_count: 0,
    total_sent_emails: 0,
    total_campaigns: 0,
  };

  const handleRefresh = () => {
    refetchStats();
    if (activeMainTab === 'subscribers') refetchSubscribers();
    else refetchDeliveries();
  };

  const handleUnsubscribe = (id, email) => {
    if (window.confirm(`Hủy đăng ký nhận bản tin cho email "${email}"?`)) {
      unsubscribeMutation.mutate(id);
    }
  };

  const handleDelete = (id, email) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hoàn toàn email "${email}" khỏi danh sách?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>Quản Lý Bản Tin (Newsletter)</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Theo dõi danh sách người đăng ký và lịch sử email thông báo tự động khi xuất bản bài viết
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
        >
          <RefreshCw size={14} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* 2. KPI Metrics Deck */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Tổng Độc Giả</span>
            <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {stats.total_subscribers}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <MailCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Đang Hoạt Động</span>
            <span className="text-xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.active_subscribers}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
            <UserMinus size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Đã Hủy Đăng Ký</span>
            <span className="text-xl font-bold font-mono tracking-tight text-slate-500 dark:text-slate-400">
              {stats.unsubscribed_count}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Send size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Email Đã Phát Hành</span>
            <span className="text-xl font-bold font-mono tracking-tight text-purple-600 dark:text-purple-400">
              {stats.total_sent_emails}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Panel with Tabs */}
      <div className="glass-panel p-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveMainTab('subscribers')}
            className={`text-sm font-semibold pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'subscribers'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users size={16} />
            <span>Danh Sách Độc Giả ({stats.total_subscribers})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('deliveries')}
            className={`text-sm font-semibold pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'deliveries'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Send size={16} />
            <span>Lịch Sử Phát Hành Bài Viết ({stats.total_campaigns})</span>
          </button>
        </div>

        {/* TAB 1: SUBSCRIBERS LIST */}
        {activeMainTab === 'subscribers' && (
          <div className="space-y-4">
            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'Tất Cả', count: stats.total_subscribers },
                  { id: 'active', label: 'Đang Nhận Tin', count: stats.active_subscribers },
                  { id: 'unsubscribed', label: 'Đã Hủy', count: stats.unsubscribed_count },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSubscriberStatusTab(tab.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      subscriberStatusTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-80">({tab.count})</span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm địa chỉ email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Subscribers Table */}
            {isSubscribersLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-500 text-xs">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                Đang tải danh sách người đăng ký...
              </div>
            ) : subscribers.length === 0 ? (
              <p className="text-center py-16 text-slate-500 text-xs">Không tìm thấy người đăng ký nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Email Độc Giả</th>
                      <th className="py-2.5 px-3">Trạng Thái</th>
                      <th className="py-2.5 px-3">Ngày Đăng Ký</th>
                      <th className="py-2.5 px-3">Ngày Hủy</th>
                      <th className="py-2.5 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">
                          {sub.email}
                        </td>
                        <td className="py-3 px-3">
                          {sub.status === 'active' ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              Đang nhận tin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30">
                              Đã hủy nhận
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                          {new Date(sub.subscribed_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                          {sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          {sub.status === 'active' && (
                            <button
                              onClick={() => handleUnsubscribe(sub.id, sub.email)}
                              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                              title="Hủy đăng ký cho email này"
                            >
                              Hủy nhận tin
                            </button>
                          )}
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDelete(sub.id, sub.email)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3 mt-4 text-xs">
                <span className="text-slate-500">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 text-xs"
                  >
                    <ChevronLeft size={13} /> Trước
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="px-2 py-1 text-xs"
                  >
                    Sau <ChevronRight size={13} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DELIVERIES HISTORY */}
        {activeMainTab === 'deliveries' && (
          <div className="space-y-4">
            {isDeliveriesLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-500 text-xs">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                Đang tải lịch sử phát hành bài viết...
              </div>
            ) : deliveries.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs space-y-2">
                <Send size={28} className="mx-auto text-slate-400 opacity-60" />
                <p>Chưa có bài viết nào được xuất bản và kích hoạt gửi bản tin.</p>
                <p className="text-[11px] text-slate-400">Khi một bài viết chuyển sang trạng thái <strong>Published</strong>, hệ thống sẽ tự động gửi email cho độc giả.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Bài Viết Xuất Bản</th>
                      <th className="py-2.5 px-3">Chuyên Mục</th>
                      <th className="py-2.5 px-3 text-center">Người Nhận</th>
                      <th className="py-2.5 px-3 text-center">Đã Gửi Thành Công</th>
                      <th className="py-2.5 px-3 text-center">Lỗi / Thất Bại</th>
                      <th className="py-2.5 px-3">Thời Gian Gửi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {deliveries.map((del) => (
                      <tr key={del.post_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100 max-w-sm">
                          <p className="truncate">{del.post_title}</p>
                          <a
                            href={`http://localhost:3000/blog/${del.post_slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>Xem bài viết</span>
                            <ExternalLink size={10} />
                          </a>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {del.category_name || '—'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {del.total_recipients}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            {del.sent_count} thành công
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {del.failed_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              {del.failed_count} lỗi
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                          {new Date(del.last_sent_at).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
