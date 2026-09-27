import React, { useState } from 'react';
import { useUsers, useUserDetail, useUpdateUserRole } from '../hooks/useUsers';
import { useDeleteComment } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button/Button';
import { Modal } from '../components/ui/Modal/Modal';
import {
  Users,
  Search,
  MessageSquare,
  Calendar,
  Mail,
  Shield,
  Trash2,
  ExternalLink,
  Clock,
  UserCheck,
} from 'lucide-react';

export const UsersManagement = () => {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { user: currentUser } = useAuth();

  const { users, isLoading } = useUsers();
  const { userDetail, userComments, isLoading: isDetailLoading } = useUserDetail(selectedUserId);
  const { deleteComment, isDeleting } = useDeleteComment();
  const { updateUserRole, isUpdatingRole } = useUpdateUserRole();

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (userId, newRole) => {
    if (window.confirm(`Bạn có chắc chắn muốn thay đổi vai trò của người dùng này thành "${newRole}"?`)) {
      updateUserRole({ id: userId, role: newRole });
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này của người dùng?')) {
      deleteComment(commentId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản Lý Người Dùng</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Xem danh sách tài khoản, vai trò và hoạt động bình luận của từng thành viên
          </p>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-sky-500 dark:text-sky-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Danh Sách Thành Viên ({filteredUsers.length})</h3>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo username, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Đang tải danh sách người dùng...
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">Không tìm thấy người dùng phù hợp.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                  <th className="py-3 px-4">NGƯỜI DÙNG</th>
                  <th className="py-3 px-4">EMAIL</th>
                  <th className="py-3 px-4">VAI TRÒ</th>
                  <th className="py-3 px-4 text-center">BÌNH LUẬN</th>
                  <th className="py-3 px-4">TRẠNG THÁI</th>
                  <th className="py-3 px-4">NGÀY TẠO</th>
                  <th className="py-3 px-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-sky-600 dark:text-sky-400">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{u.username}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">ID: #{u.id}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role === 'admin' ? 'super_admin' : u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={isUpdatingRole || currentUser?.id === u.id}
                        className={`text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-slate-900 border outline-none cursor-pointer transition-colors ${
                          u.role === 'super_admin' || u.role === 'admin'
                            ? 'border-purple-500/40 text-purple-700 dark:text-purple-300'
                            : u.role === 'editor'
                            ? 'border-amber-500/40 text-amber-700 dark:text-amber-300'
                            : u.role === 'author'
                            ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'
                        } ${currentUser?.id === u.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                        title={currentUser?.id === u.id ? 'Không thể tự đổi vai trò của chính mình' : 'Thay đổi vai trò'}
                      >
                        <option value="super_admin" className="bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300">Super Admin</option>
                        <option value="editor" className="bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300">Editor</option>
                        <option value="author" className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300">Author</option>
                        <option value="user" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400">User (Độc giả)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <MessageSquare size={12} /> {u.comment_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Hoạt động
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedUserId(u.id)}
                        className="px-2.5 py-1 text-xs cursor-pointer"
                      >
                        Chi Tiết & Bình Luận
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Xem Chi Tiết User & Các Comment */}
      <Modal
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        title="Hồ Sơ & Bình Luận Của Người Dùng"
      >
        {isDetailLoading || !userDetail ? (
          <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Đang tải dữ liệu người dùng...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Thông tin User */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  {userDetail.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{userDetail.username}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                      {userDetail.role}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      {userDetail.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      Ngày tạo: {new Date(userDetail.created_at).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <UserCheck size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      Trạng thái: Hoạt động
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      Tổng bình luận: <strong className="text-slate-900 dark:text-white">{userComments.length}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách bình luận & bài viết liên quan */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare size={16} className="text-emerald-500 dark:text-emerald-400" />
                Các bình luận đã đăng ({userComments.length})
              </h4>

              {userComments.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  Người dùng này chưa có bình luận nào trên hệ thống.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {userComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium truncate flex items-center gap-1">
                          <ExternalLink size={12} />
                          Bài viết: {comment.post_title}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                          <Clock size={11} />
                          {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950/60 p-2.5 rounded border border-slate-200 dark:border-slate-800/80">
                        {comment.content}
                      </p>
                      <div className="flex justify-end">
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
        )}
      </Modal>
    </div>
  );
};
