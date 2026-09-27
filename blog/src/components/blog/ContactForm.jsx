'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Mail, RotateCcw } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'feedback',
    message: '',
  });

  const [status, setStatus] = useState({
    state: 'idle', // 'idle' | 'submitting' | 'success' | 'error'
    message: '',
  });

  const subjectOptions = [
    { value: 'feedback', label: 'Góp ý & Đóng góp nội dung bài viết' },
    { value: 'technical', label: 'Báo cáo lỗi kỹ thuật hoặc trải nghiệm UI' },
    { value: 'topic_request', label: 'Đề xuất chủ đề phân tích chuyên sâu mới' },
    { value: 'collaboration', label: 'Hợp tác bài viết chuyên gia & Bản quyền' },
    { value: 'other', label: 'Nội dung khác' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({
        state: 'error',
        message: 'Vui lòng điền đầy đủ họ tên, email và nội dung liên hệ.',
      });
      return;
    }

    if (formData.message.trim().length < 15) {
      setStatus({
        state: 'error',
        message: 'Nội dung tin nhắn cần tối thiểu 15 ký tự để ban biên tập nắm bắt rõ ràng.',
      });
      return;
    }

    try {
      setStatus({ state: 'submitting', message: '' });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gửi liên hệ thất bại. Vui lòng thử lại.');
      }

      setStatus({
        state: 'success',
        message: data.message || 'Cảm ơn bạn! Ban biên tập TechInsight đã tiếp nhận thông điệp và sẽ phản hồi qua email trong vòng 24–48 giờ.',
      });

      // Lưu trữ tạm họ tên & email vào localStorage để tiện cho lần sau
      try {
        localStorage.setItem('blog_reader_name', formData.name);
        localStorage.setItem('blog_reader_email', formData.email);
      } catch (err) {}
    } catch (err) {
      setStatus({
        state: 'error',
        message: err.message || 'Đã có lỗi xảy ra trong quá trình gửi tin nhắn. Bạn vui lòng thử lại hoặc gửi trực tiếp qua email.',
      });
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: 'feedback',
      message: '',
    });
    setStatus({ state: 'idle', message: '' });
  };

  // Tạo link mailto dự phòng
  const mailtoSubject = encodeURIComponent(`[TechInsight Liên Hệ] ${formData.subject}`);
  const mailtoBody = encodeURIComponent(`Họ tên: ${formData.name}\nEmail: ${formData.email}\n\nNội dung:\n${formData.message}`);
  const mailtoHref = `mailto:editorial@techinsight.dev?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
      <div className="mb-6 pb-4 border-b border-[var(--color-border)]">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
          Gửi thư tới Ban biên tập
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Mọi thông tin liên hệ được bảo mật và chỉ sử dụng cho mục đích trao đổi công việc
        </p>
      </div>

      {status.state === 'success' ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="text-base font-bold text-[var(--color-text-primary)]">
            Đã tiếp nhận tin nhắn thành công
          </h4>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
            {status.message}
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Gửi thêm tin nhắn khác</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status.state === 'error' && (
            <div className="p-3.5 rounded-[var(--radius-md)] bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{status.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs sm:text-sm focus:border-[var(--color-brand)] outline-none text-[var(--color-text-primary)] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
                Địa chỉ Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs sm:text-sm focus:border-[var(--color-brand)] outline-none text-[var(--color-text-primary)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
              Chủ đề liên hệ
            </label>
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs sm:text-sm focus:border-[var(--color-brand)] outline-none text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              {subjectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
              Nội dung thông điệp <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Chia sẻ chi tiết góp ý của bạn hoặc câu hỏi dành cho ban biên tập..."
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs sm:text-sm focus:border-[var(--color-brand)] outline-none text-[var(--color-text-primary)] transition-colors resize-y leading-relaxed"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="submit"
              disabled={status.state === 'submitting'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {status.state === 'submitting' ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi thông điệp...</span>
                </>
              ) : (
                <>
                  <span>Gửi tin nhắn</span>
                  <Send size={13} />
                </>
              )}
            </button>

            <a
              href={mailtoHref}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
            >
              <Mail size={13} />
              <span>Gửi qua ứng dụng Email</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
