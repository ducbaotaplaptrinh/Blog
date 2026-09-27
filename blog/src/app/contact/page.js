import ContactForm from '@/components/blog/ContactForm';
import { Mail, Clock, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Liên Hệ Ban Biên Tập & Đóng Góp Ý Kiến | TechInsight',
  description: 'Gửi phản hồi, đề xuất đề tài công nghệ chuyên sâu hoặc kết nối hợp tác bài viết cùng ban biên tập TechInsight.',
  alternates: {
    canonical: 'http://localhost:3000/contact',
  },
  openGraph: {
    title: 'Liên Hệ Ban Biên Tập & Đóng Góp Ý Kiến | TechInsight',
    description: 'Kênh tiếp nhận ý kiến đóng góp, đề xuất đề tài và kết nối chuyên môn cùng TechInsight.',
    url: 'http://localhost:3000/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  const contactGuides = [
    {
      title: 'Góp ý chuyên môn & đính chính bài viết',
      desc: 'Nếu bạn phát hiện sai sót kỹ thuật hoặc có góc nhìn phản biện sâu sắc hơn cho một bài phân tích, xin vui lòng gửi kèm link bài viết.',
      icon: MessageSquare,
    },
    {
      title: 'Đề xuất chủ đề công nghệ mới',
      desc: 'Bạn đang băn khoăn về một mẫu thiết kế kiến trúc hay công nghệ mới nổi? Hãy gợi ý để đội ngũ biên tập đưa vào danh sách nghiên cứu.',
      icon: HelpCircle,
    },
    {
      title: 'Cộng tác bài viết chuyên sâu',
      desc: 'Chúng tôi hoan nghênh các kỹ sư, chuyên gia dữ liệu và kiến trúc sư hệ thống chia sẻ case-study thực tế từ doanh nghiệp của mình.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-4">
      {/* Header Banner */}
      <section className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent)] bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
          Kênh kết nối độc giả
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
          Liên hệ Ban biên tập TechInsight
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Chúng tôi trân trọng mọi góp ý, câu hỏi kỹ thuật và cơ hội hợp tác trao đổi tri thức cùng cộng đồng công nghệ.
        </p>
      </section>

      {/* Main Grid: Information & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Office info & Contact Guidelines (5 cols) */}
        <aside className="lg:col-span-5 space-y-6">
          {/* Direct Contact Card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-subtle)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              Thông tin trực tiếp
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[var(--color-brand)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[var(--color-text-muted)] font-medium">Hòm thư biên tập chính:</p>
                  <a
                    href="mailto:editorial@techinsight.dev"
                    className="font-semibold text-[var(--color-brand)] hover:underline"
                  >
                    editorial@techinsight.dev
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-[var(--color-brand)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[var(--color-text-muted)] font-medium">Thời gian tiếp nhận & xử lý:</p>
                  <p className="font-semibold text-[var(--color-text-primary)]">
                    Thứ Hai – Thứ Sáu (09:00 – 18:00)
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Cam kết phản hồi trong vòng 24–48 giờ làm việc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-1">
              Các trường hợp hỗ trợ
            </h3>
            {contactGuides.map((guide, idx) => {
              const Icon = guide.icon;
              return (
                <div
                  key={idx}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={15} className="text-[var(--color-brand)]" />
                    <h4 className="text-xs font-bold text-[var(--color-text-primary)]">
                      {guide.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                    {guide.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Contact Form (7 cols) */}
        <section className="lg:col-span-7">
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
