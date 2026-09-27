import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../schemas/authSchema';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services';
import { Input } from '../components/ui/Input/Input';
import { Button } from '../components/ui/Button/Button';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  CheckCircle,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmitPassword = async (data) => {
    setSubmitting(true);
    clearErrors();
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      reset();
    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      if (serverMsg.includes('Mật khẩu hiện tại')) {
        setError('currentPassword', {
          type: 'manual',
          message: serverMsg,
        });
      } else if (serverMsg.includes('trùng')) {
        setError('newPassword', {
          type: 'manual',
          message: serverMsg,
        });
      } else {
        toast.error(serverMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi hệ thống');
    navigate('/login');
  };

  // Badge màu sắc vai trò
  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return {
          label: 'Super Admin (Toàn quyền)',
          style: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
        };
      case 'editor':
        return {
          label: 'Editor (Biên tập viên)',
          style: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
        };
      case 'author':
        return {
          label: 'Author (Tác giả bài viết)',
          style: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
        };
      default:
        return {
          label: 'User (Độc giả)',
          style: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30',
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Chưa cập nhật';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <User className="text-indigo-500" size={32} />
          Thông Tin Tài Khoản
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Quản lý thông tin định danh, tùy chọn giao diện và bảo mật tài khoản của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1: Thẻ thông tin cá nhân & Theme Switcher */}
        <div className="space-y-6">
          {/* Card Hồ sơ */}
          <div className="glass-panel p-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-[var(--border-color)]">
              {/* Avatar circle */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-500/20 border-2 border-white/20">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white"
                  title="Tài khoản đang hoạt động"
                >
                  <CheckCircle size={14} />
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.username}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.email}
              </p>

              <div className="mt-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${roleInfo.style}`}
                >
                  {roleInfo.label}
                </span>
              </div>
            </div>

            {/* Chi tiết tài khoản */}
            <div className="py-4 space-y-3.5 text-sm">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Mail size={16} className="text-indigo-400" /> Email
                </span>
                <span className="font-medium text-slate-900 dark:text-white truncate max-w-[170px]">
                  {user?.email}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Shield size={16} className="text-indigo-400" /> Vai trò
                </span>
                <span className="font-medium text-slate-900 dark:text-white uppercase text-xs">
                  {user?.role}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Calendar size={16} className="text-indigo-400" /> Ngày tham gia
                </span>
                <span className="font-medium text-slate-900 dark:text-white text-xs">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Nút Đăng xuất */}
            <div className="pt-4 border-t border-[var(--border-color)]">
              <Button
                variant="danger"
                onClick={handleLogout}
                className="w-full text-xs py-2"
              >
                <LogOut size={14} /> Đăng Xuất Khỏi Thiết Bị
              </Button>
            </div>
          </div>
        </div>

        {/* Cột 2 & 3: Khu vực Đổi mật khẩu bảo mật */}
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[var(--border-color)]">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <KeyRound size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Đổi Mật Khẩu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cập nhật mật khẩu định kỳ để nâng cao tính an toàn và bảo mật cho tài khoản quản trị.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4 max-w-xl">
            {/* Mật khẩu hiện tại */}
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              placeholder="Nhập mật khẩu bạn đang sử dụng"
              icon={Lock}
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />

            {/* Mật khẩu mới */}
            <Input
              label="Mật khẩu mới"
              type="password"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              icon={KeyRound}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            {/* Xác nhận mật khẩu mới */}
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              placeholder="Nhập lại chính xác mật khẩu mới"
              icon={KeyRound}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Gợi ý tiêu chuẩn mật khẩu */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-[var(--border-color)] text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                🛡️ Yêu cầu bảo mật mật khẩu:
              </p>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>Độ dài tối thiểu từ 6 ký tự trở lên</li>
                <li>Mật khẩu mới không được trùng với mật khẩu hiện tại</li>
                <li>Khuyến nghị kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
              </ul>
            </div>

            {/* Nút Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full sm:w-auto min-w-[160px]"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    Cập Nhật Mật Khẩu
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
