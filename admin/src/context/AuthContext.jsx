import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const staffRoles = ['super_admin', 'editor', 'author', 'admin'];

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          const currentUser = response.data.data.user;
          if (staffRoles.includes(currentUser.role)) {
            setUser(currentUser);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Session expired or invalid token');
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;

    // Kiểm tra quyền hạn trước khi lưu phiên đăng nhập vào Admin
    if (!staffRoles.includes(user.role)) {
      const forbiddenError = new Error('Tài khoản của bạn không có quyền truy cập trang Quản trị (Chỉ dành cho Ban quản trị).');
      forbiddenError.isForbidden = true;
      throw forbiddenError;
    }

    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
