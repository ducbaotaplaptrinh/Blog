import React, { useState, useEffect } from 'react';
import { useContactDetail, useUpdateContactStatus, useDeleteContact } from '../../hooks/useContacts';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button/Button';
import { 
  X, Mail, User, Clock, AlertCircle, CheckCircle2, 
  Send, Trash2, ShieldAlert, Sparkles, MessageSquare, Tag, ExternalLink 
} from 'lucide-react';

export const ContactDetailDrawer = ({ isOpen, onClose, contactId }) => {
  const { user } = useAuth();
  const { data: contact, isLoading } = useContactDetail(contactId);
  const updateStatusMutation = useUpdateContactStatus();
  const deleteContactMutation = useDeleteContact();

  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (contact) {
      setAdminNotes(contact.admin_notes || '');
    }
  }, [contact]);

  // Hỗ trợ đóng ngăn kéo bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const getSubjectBadge = (type) => {
    switch (type) {
      case 'feedback':
        return { label: 'Góp ý nội dung', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'technical':
        return { label: 'Báo lỗi kỹ thuật', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      case 'topic_request':
        return { label: 'Đề xuất chủ đề', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      case 'collaboration':
        return { label: 'Hợp tác bài viết', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'copyright':
        return { label: 'Bản quyền', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      default:
        return { label: 'Nội dung khác', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return { label: 'Chưa xử lý', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
      case 'in_progress':
        return { label: 'Đang xử lý', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'resolved':
        return { label: 'Đã giải quyết', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'spam':
        return { label: 'Thư rác', color: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20' };
      default:
        return { label: status, color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
    }
  };

  const handleUpdateStatus = (newStatus) => {
    if (!contact) return;
    updateStatusMutation.mutate(
      { id: contact.id, status: newStatus, admin_notes: adminNotes },
      {
        onSuccess: () => {
          if (newStatus === 'resolved' || newStatus === 'spam') {
            onClose();
          }
        },
      }
    );
  };

  const handleDelete = () => {
    if (!contact) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn thư liên hệ này?')) {
      deleteContactMutation.mutate(contact.id, {
        onSuccess: () => onClose(),
      });
    }
  };

  const subjectBadge = getSubjectBadge(contact?.subject_type);
  const statusBadge = getStatusBadge(contact?.status);

  // Soạn link mailto
  const mailtoSubject = encodeURIComponent(`[TechInsight Ban Biên Tập] Phản hồi: ${contact?.title || contact?.subject_type}`);
  const mailtoBody = encodeURIComponent(`Xin chào ${contact?.name},\n\nBan biên tập TechInsight đã nhận được thư của bạn về "${contact?.title || 'góp ý bài viết'}".\n\n[Nhập nội dung phản hồi tại đây]\n\nTrân trọng,\nBan Biên Tập TechInsight`);
  const mailtoLink = `mailto:${contact?.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div
      onClick={onClose}
      className="fixed !-mt-0 inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end cursor-pointer transition-opacity duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl cursor-default text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base">Chi Tiết Thư Liên Hệ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading || !contact ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Đang tải nội dung thư...
            </div>
          ) : (
            <>
              {/* Top Badges & Time */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${subjectBadge.color}`}>
                    {subjectBadge.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={13} />
                  <span>{new Date(contact.created_at).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              {/* Sender Details */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-bold text-sm">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {contact.name}
                    </h4>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{contact.email}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {contact.assigned_username && (
                  <p className="text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800/60 pt-2">
                    Người phụ trách: <strong className="text-slate-700 dark:text-slate-300">{contact.assigned_username}</strong>
                  </p>
                )}
              </div>

              {/* Subject Title */}
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Tiêu đề bức thư
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {contact.title || 'Không có tiêu đề cụ thể'}
                </h2>
              </div>

              {/* Message Content */}
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Nội dung liên hệ
                </span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 font-sans">
                  {contact.message}
                </div>
              </div>

              {/* Admin Internal Notes */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
                  Ghi chú nội bộ biên tập viên
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ghi lại tiến độ trao đổi hoặc lưu ý khi xử lý thư này..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {contact && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <a
                href={mailtoLink}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send size={13} />
                <span>Trả Lời Email</span>
              </a>

              {contact.status !== 'in_progress' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('in_progress')}
                  disabled={updateStatusMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-semibold border border-amber-500/20 transition-colors cursor-pointer"
                >
                  Đang Xử Lý
                </button>
              )}

              {contact.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={updateStatusMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold border border-emerald-500/20 transition-colors cursor-pointer"
                >
                  Đã Xong
                </button>
              )}

              {contact.status !== 'spam' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('spam')}
                  disabled={updateStatusMutation.isPending}
                  className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                  title="Đánh dấu thư rác"
                >
                  <ShieldAlert size={14} />
                </button>
              )}
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteContactMutation.isPending}
                className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Xóa thư liên hệ"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
