import React, { useState } from 'react';
import { useContacts, useContactStats } from '../hooks/useContacts';
import { ContactDetailDrawer } from '../components/contacts/ContactDetailDrawer';
import { Button } from '../components/ui/Button/Button';
import { 
  Inbox, Mail, Clock, AlertCircle, CheckCircle2, 
  Search, Filter, ChevronLeft, ChevronRight, MessageSquare, 
  ShieldAlert, RefreshCw, Eye, ArrowUpRight, Sparkles 
} from 'lucide-react';

export const ContactsManagement = () => {
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: statsData, isLoading: isStatsLoading } = useContactStats();
  const { contacts, pagination, isLoading: isContactsLoading, refetch } = useContacts({
    status: selectedStatusTab,
    search,
    page,
    limit: 10,
  });

  const stats = statsData || { total: 0, new: 0, in_progress: 0, resolved: 0, spam: 0 };

  const statusTabs = [
    { id: 'all', label: 'Tất Cả Thư', count: stats.total },
    { id: 'new', label: 'Chưa Xử Lý', count: stats.new, highlight: stats.new > 0 },
    { id: 'in_progress', label: 'Đang Xử Lý', count: stats.in_progress },
    { id: 'resolved', label: 'Đã Giải Quyết', count: stats.resolved },
    { id: 'spam', label: 'Thư Rác', count: stats.spam },
  ];

  const handleOpenDetail = (id) => {
    setSelectedContactId(id);
    setIsDrawerOpen(true);
  };

  const getSubjectLabel = (type) => {
    switch (type) {
      case 'feedback': return { text: 'Góp ý nội dung', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
      case 'technical': return { text: 'Báo lỗi kỹ thuật', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      case 'topic_request': return { text: 'Đề xuất chủ đề', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
      case 'collaboration': return { text: 'Hợp tác bài viết', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'copyright': return { text: 'Bản quyền', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      default: return { text: 'Khác', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return { label: 'Mới', bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' };
      case 'in_progress': return { label: 'Đang xử lý', bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'resolved': return { label: 'Đã xong', bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'spam': return { label: 'Rác', bg: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30' };
      default: return { label: status, bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>Liên Hệ Tòa Soạn</span>
            {stats.new > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                {stats.new} thư mới
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Tiếp nhận ý kiến đóng góp, đề xuất bài viết và hỗ trợ kỹ thuật từ độc giả TechInsight
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
        >
          <RefreshCw size={14} />
          <span>Làm mới hộp thư</span>
        </button>
      </div>

      {/* 2. KPI Metrics Deck */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Chưa Xử Lý</span>
            <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {stats.new}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Đang Xử Lý</span>
            <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {stats.in_progress}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Đã Giải Quyết</span>
            <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {stats.resolved}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Thư Rác</span>
            <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {stats.spam}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Inbox Table Panel */}
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
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Inbox size={20} className="text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Hòm Thư Liên Hệ ({pagination.total})
            </h3>
          </div>

          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm người gửi, email, nội dung..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Table / List */}
        {isContactsLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
            Đang tải danh sách thư liên hệ...
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-2">
            <Mail size={32} className="mx-auto text-slate-400 opacity-60" />
            <p className="font-medium text-sm">Hộp thư hiện tại không có tin nhắn nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Người Gửi</th>
                  <th className="py-3 px-4">Chủ Đề & Tiêu Đề</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {contacts.map((c) => {
                  const subjectTag = getSubjectLabel(c.subject_type);
                  const statusTag = getStatusBadge(c.status);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleOpenDetail(c.id)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        c.status === 'new' ? 'bg-indigo-50/30 dark:bg-indigo-950/10 font-medium' : ''
                      }`}
                    >
                      {/* Sender */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {c.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {c.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Preview */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${subjectTag.color} font-medium`}>
                            {subjectTag.text}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {c.title || c.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {c.message}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusTag.bg}`}>
                          {statusTag.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {new Date(c.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(c.id);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Trang {pagination.page} / {pagination.totalPages} ({pagination.total} thư)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 text-xs"
              >
                <ChevronLeft size={14} /> Trước
              </Button>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-2.5 py-1 text-xs"
              >
                Sau <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Contact Detail Drawer */}
      <ContactDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedContactId(null);
        }}
        contactId={selectedContactId}
      />
    </div>
  );
};
