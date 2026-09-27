import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../schemas/authSchema';
import { authService } from '../services';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input/Input';
import { Button } from '../components/ui/Button/Button';
import { UserPlus, User, Mail, Lock } from 'lucide-react';

const Register = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast.success('Đăng ký tài khoản thành công! Vui lòng liên hệ Quản trị viên cấp quyền để vào Admin.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại. Email hoặc Username có thể đã được sử dụng!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors">
      <div className="glass-panel w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Đăng Ký Tài Khoản</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Tạo tài khoản Quản trị viên mới</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Tên tài khoản (Username)"
            placeholder="admin_nguyen"
            icon={User}
            error={errors.username?.message}
            {...register('username')}
          />

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

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            disabled={submitting}
            className="w-full mt-2"
          >
            <UserPlus size={18} />
            {submitting ? 'Đang tạo tài khoản...' : 'Đăng Ký Nhanh'}
          </Button>

          <div className="text-center mt-4">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Đã có tài khoản? </span>
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 text-sm font-medium">
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
