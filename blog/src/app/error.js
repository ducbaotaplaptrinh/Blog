'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled blog error:', error);
  }, [error]);

  return (
    <div className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] text-[var(--color-error)] flex items-center justify-center mb-4 border border-[var(--color-border)]">
        <AlertCircle size={22} />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
        Đã xảy ra lỗi tải dữ liệu
      </h2>
      <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mb-5 leading-relaxed">
        Không thể kết nối đến máy chủ hoặc máy chủ backend chưa khởi động. Vui lòng thử lại.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-medium text-xs transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}
