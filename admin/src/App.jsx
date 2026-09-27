import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import Login from './pages/Login';
import Register from './pages/Register';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { PostsManagement } from './pages/PostsManagement';
import { CategoriesManagement } from './pages/CategoriesManagement';
import { UsersManagement } from './pages/UsersManagement';
import { CommentsManagement } from './pages/CommentsManagement';
import { Analytics } from './pages/Analytics';
import { ContactsManagement } from './pages/ContactsManagement';
import { NewsletterManagement } from './pages/NewsletterManagement';
import { Profile } from './pages/Profile';
import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, logout } = useContext(AuthContext);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#fff' }}>Đang tải ứng dụng...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const staffRoles = ['super_admin', 'editor', 'author', 'admin'];
  const hasStaffAccess = staffRoles.includes(user.role);

  if (!hasStaffAccess) {
    logout();
    return <Navigate to="/login" replace state={{ error: 'Tài khoản của bạn không có quyền truy cập trang Quản trị (Chỉ dành cho Ban quản trị).' }} />;
  }

  // Nếu route có yêu cầu vai trò cụ thể
  if (allowedRoles) {
    const isSuper = user.role === 'super_admin' || user.role === 'admin';
    if (!isSuper && !allowedRoles.includes(user.role)) {
      return <Navigate to="/posts" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' } }} />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={
                  <ProtectedRoute allowedRoles={['super_admin', 'editor', 'admin']}>
                    <DashboardOverview />
                  </ProtectedRoute>
                } />
                <Route path="analytics" element={
                  <ProtectedRoute allowedRoles={['super_admin', 'editor', 'admin']}>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="posts" element={<PostsManagement />} />
                <Route path="categories" element={
                  <ProtectedRoute allowedRoles={['super_admin', 'editor', 'admin']}>
                    <CategoriesManagement />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                    <UsersManagement />
                  </ProtectedRoute>
                } />
                <Route path="comments" element={
                  <ProtectedRoute allowedRoles={['super_admin', 'editor', 'admin']}>
                    <CommentsManagement />
                  </ProtectedRoute>
                } />
                <Route path="contacts" element={
                  <ProtectedRoute allowedRoles={['super_admin', 'editor', 'admin']}>
                    <ContactsManagement />
                  </ProtectedRoute>
                } />
                <Route path="newsletter" element={
                  <ProtectedRoute allowedRoles={['super_admin', 'editor', 'admin']}>
                    <NewsletterManagement />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
