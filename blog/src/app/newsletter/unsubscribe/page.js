'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, MailX, ArrowLeft, RefreshCw } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: '',
  });

  useEffect(() => {
    if (!token) {
      setStatus({
        loading: false,
        success: false,
        message: 'Không tìm thấy mã xác nhận hủy đăng ký trong liên kết.',
      });
      return;
    }

    const performUnsubscribe = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok) {
          setStatus({
            loading: false,
            success: true,
            message: data.message || 'Bạn đã hủy đăng ký nhận bản tin thành công.',
          });
        } else {
          setStatus({
            loading: false,
            success: false,
            message: data.message || 'Liên kết hủy đăng ký không hợp lệ hoặc đã hết hạn.',
          });
        }
      } catch (err) {
        setStatus({
          loading: false,
          success: false,
          message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.',
        });
      }
    };

    performUnsubscribe();
  }, [token]);

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-subtle)] text-center space-y-5">
      {status.loading ? (
        <div className="py-8 space-y-3">
          <div className="w-10 h-10 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--color-text-secondary)]">Đang xác nhận hủy đăng ký...</p>
        </div>
      ) : status.success ? (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Hủy Đăng Ký Thành Công
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {status.message} Bạn sẽ không còn nhận email thông báo bài viết mới từ TechInsight.
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Nếu bạn đổi ý trong tương lai, bạn luôn có thể đăng ký lại tại chân trang bài viết.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Yêu Cầu Chưa Hoàn Tất
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {status.message}
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-[var(--color-border)]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)] hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Quay về trang chủ TechInsight</span>
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">Đang tải...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
