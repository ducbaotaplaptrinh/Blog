'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Mail } from 'lucide-react';

export default function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }

      setMessage(data.message || 'Đăng ký nhận tin thành công!');
      setEmail('');
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-5 sm:p-6 shadow-[var(--shadow-subtle)]">
      <div className="flex items-center gap-2 mb-2 text-[var(--color-brand)]">
        <Mail size={16} />
        <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Bản tin công nghệ</h4>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">
        Nhận bài phân tích chuyên sâu về kiến trúc phần mềm và kỹ thuật lập trình mới nhất hàng tuần.
      </p>

      {message && !isError ? (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] text-[var(--color-success)] text-xs flex items-center gap-2 border border-[var(--color-border)]">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {message && isError && (
            <p className="text-[11px] text-rose-500 font-medium">{message}</p>
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="Địa chỉ email của bạn..."
            className="w-full px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] text-xs focus:outline-none focus:border-[var(--color-brand)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={12} />
            )}
            <span>{loading ? 'Đang đăng ký...' : 'Đăng ký nhận tin'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
