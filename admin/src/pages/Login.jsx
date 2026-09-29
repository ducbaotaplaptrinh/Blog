import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/authSchema';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input/Input';
import { Button } from '../components/ui/Button/Button';
import { LogIn, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.error) {
      toast.error(location.state.error);
      // Xóa state để không bị toast lặp lại
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    clearErrors();
    try {
      await login(data.email, data.password);
      toast.success('Đăng nhập thành công! Chào mừng bạn quay trở lại.');
      navigate('/');
    } catch (err) {
      if (err.isForbidden) {
        toast.error(err.message);
        setError('email', {
          type: 'manual',
          message: err.message,
        });
        return;
      }

      const serverMessage = err.response?.data?.message || '';

      if (
        err.response?.status === 401 ||
        err.response?.status === 400 ||
        serverMessage.toLowerCase().includes('mật khẩu') ||
        serverMessage.toLowerCase().includes('password') ||
        serverMessage.toLowerCase().includes('email') ||
        serverMessage.toLowerCase().includes('tài khoản')
      ) {
        const errorText = 'Email hoặc mật khẩu không chính xác';

        // Báo lỗi dưới cả 2 ô input Email và Mật khẩu
        setError('email', {
          type: 'manual',
          message: errorText,
        });

        setError(
          'password',
          {
            type: 'manual',
            message: errorText,
          },
          { shouldFocus: true }
        );
      } else {
        toast.error(serverMessage || 'Đăng nhập thất bại. Vui lòng thử lại!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors">
      <div className="glass-panel w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Quản Trị Hệ Thống</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Đăng nhập để quản lý bài viết và danh mục</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="admin@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            disabled={submitting}
            className="w-full mt-2"
          >
            <LogIn size={18} />
            {submitting ? 'Đang xác thực...' : 'Đăng Nhập'}
          </Button>

          <div className="text-center mt-4">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Chưa có tài khoản? </span>
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 text-sm font-medium">
              Đăng ký tài khoản
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
