import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useAdminDashboard } from '../../hooks/useAdmin';
import { Button } from '../ui/Button/Button';
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  FolderTree,
  Users,
  MessageSquare,
  Inbox,
  Send,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Sun,
  Moon,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { stats } = useAdminDashboard();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi trang quản trị');
    navigate('/login');
  };

  const isStaffModerator = ['super_admin', 'editor', 'admin'].includes(user?.role);

  const allNavItems = [
    {
      to: '/',
      label: 'Bảng Điều Khiển',
      icon: LayoutDashboard,
      end: true,
      allowedRoles: ['super_admin', 'editor', 'admin'],
    },
    {
      to: '/analytics',
      label: 'Hiệu Suất Nội Dung',
      icon: TrendingUp,
      allowedRoles: ['super_admin', 'editor', 'admin'],
    },
    {
      to: '/posts',
      label: user?.role === 'author' ? 'Bài Viết Của Tôi' : 'Quản Lý Bài Viết',
      icon: FileText,
      badge: isStaffModerator && stats?.pendingPosts > 0 ? stats.pendingPosts : null,
      badgeColor: 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
      allowedRoles: ['super_admin', 'editor', 'author', 'admin'],
    },
    {
      to: '/categories',
      label: 'Quản Lý Danh Mục',
      icon: FolderTree,
      allowedRoles: ['super_admin', 'editor', 'admin'],
    },
    {
      to: '/users',
      label: 'Quản Lý Người Dùng',
      icon: Users,
      allowedRoles: ['super_admin', 'admin'],
    },
    {
      to: '/comments',
      label: 'Quản Lý Bình Luận',
      icon: MessageSquare,
      badge: isStaffModerator && stats?.pendingComments > 0 ? stats.pendingComments : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      allowedRoles: ['super_admin', 'editor', 'admin'],
    },
    {
      to: '/contacts',
      label: 'Liên Hệ Tòa Soạn',
      icon: Inbox,
      badge: isStaffModerator && stats?.newContacts > 0 ? stats.newContacts : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      allowedRoles: ['super_admin', 'editor', 'admin'],
    },
    {
      to: '/newsletter',
      label: 'Quản Lý Bản Tin',
      icon: Send,
      allowedRoles: ['super_admin', 'editor', 'admin'],
    },
    {
      to: '/profile',
      label: 'Hồ Sơ & Bảo Mật',
      icon: UserIcon,
      allowedRoles: ['super_admin', 'editor', 'author', 'admin'],
    },
  ];

  // Lọc menu theo vai trò người dùng
  const navItems = allNavItems.filter((item) =>
    item.allowedRoles.includes(user?.role) ||
    (user?.role === 'admin' && item.allowedRoles.includes('super_admin'))
  );

  // Màu sắc badge vai trò
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30';
      case 'editor':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30';
      case 'author':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-500/30';
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] p-6 flex flex-col justify-between shrink-0 sticky top-0 h-screen transition-colors duration-200 shadow-sm">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo / Header with Compact Theme Toggle */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  TechInsight
                </h2>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">
                  Command Center
                </span>
              </div>
            </div>

            {/* Compact Theme Toggle Icon */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer shrink-0"
              title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun size={17} className="text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={17} className="text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>
          </div>

          {/* Quick External Link to Public Blog */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-1.5 mb-4 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md transition-colors"
          >
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Xem Public Blog
            </span>
            <ExternalLink size={12} />
          </a>

          {/* Nav Links with custom scroll if too many items */}
          <nav className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card & Logout */}
        <div className="pt-4 border-t border-[var(--border-color)] shrink-0">
          <div
            onClick={() => navigate('/profile')}
            className="p-3 bg-slate-100/90 dark:bg-slate-950/60 border border-[var(--border-color)] hover:border-indigo-500/50 rounded-lg mb-3 cursor-pointer transition-all duration-200 hover:shadow-md group"
            title="Nhấp để xem hồ sơ và đổi mật khẩu"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {user?.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                    {user?.username}
                  </p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${getRoleBadgeStyle(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="truncate">{user?.email}</span>
                  <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="danger"
            className="w-full text-xs py-2"
          >
            <LogOut size={14} /> Đăng Xuất
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
