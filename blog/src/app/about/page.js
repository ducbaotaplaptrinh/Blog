import Link from 'next/link';
import { ShieldCheck, BookOpen, Cpu, Sparkles, Layers, ArrowRight, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Về Chúng Tôi - Sứ Mệnh & Triết Lý Biên Tập | TechInsight',
  description: 'Khám phá tôn chỉ hoạt động, tiêu chuẩn biên tập khắt khe và định hướng nội dung công nghệ chuyên sâu của TechInsight.',
  alternates: {
    canonical: 'http://localhost:3000/about',
  },
  openGraph: {
    title: 'Về Chúng Tôi - Sứ Mệnh & Triết Lý Biên Tập | TechInsight',
    description: 'Chia sẻ kiến thức công nghệ chuyên sâu, kỹ thuật lập trình web và kiến trúc phần mềm hiện đại.',
    url: 'http://localhost:3000/about',
    type: 'website',
  },
};

export default function AboutPage() {
  const pillars = [
    {
      title: 'Kiến Trúc Hệ Thống',
      desc: 'Phân tích thiết kế hệ thống chịu tải cao, Microservices, cơ sở dữ liệu phân tán và kiến trúc phần mềm bền vững theo thời gian.',
      icon: Layers,
    },
    {
      title: 'Kỹ Thuật Frontend Chuyên Sâu',
      desc: 'Khám phá sâu cơ chế hoạt động của React 19, Next.js Server Components, tối ưu hóa bundle size, Tree Shaking và trải nghiệm web mượt mà.',
      icon: Cpu,
    },
    {
      title: 'Hạ Tầng & Vận Hành Bền Bỉ',
      desc: 'Kinh nghiệm triển khai thực chiến với Docker, Kubernetes, CI/CD tự động và bảo mật hệ thống API theo tiêu chuẩn OWASP.',
      icon: ShieldCheck,
    },
    {
      title: 'Văn Hóa Kỹ Thuật Thực Nghiệm',
      desc: 'Mọi luận điểm đều đi kèm mã nguồn mẫu, số liệu đo lường thực tế và kiểm chứng trên môi trường thực tế, nói không với lý thuyết sáo rỗng.',
      icon: Sparkles,
    },
  ];

  const editorialPrinciples = [
    {
      rule: 'Kiểm chứng thực nghiệm trước khi công bố',
      detail: 'Mọi kỹ thuật, cấu hình hay thư viện được đề cập đều đã được chạy thử nghiệm trên môi trường kiểm thử thực tế và ghi nhận số liệu cụ thể.',
    },
    {
      rule: 'Độc lập và liêm chính học thuật',
      detail: 'TechInsight không nhận bài viết quảng cáo ẩn, không PR trá hình cho các sản phẩm không đạt chất lượng. Tiếng nói của tác giả là trung thực và khách quan.',
    },
    {
      rule: 'Tôn trọng thời gian của độc giả',
      detail: 'Nội dung đi thẳng vào bản chất vấn đề kỹ thuật, lược bỏ các phần dạo đầu vô nghĩa, chú trọng cấu trúc mạch lạc và khả năng ứng dụng ngay.',
    },
    {
      rule: 'Minh bạch và sẵn sàng tiếp thu phản biện',
      detail: 'Chúng tôi duy trì hệ thống bình luận đa cấp mở để mọi kỹ sư và độc giả có thể trao đổi, đặt câu hỏi hoặc bổ sung các góc nhìn chuyên môn sâu hơn.',
    },
  ];

  return (
    <div className="space-y-16 max-w-4xl mx-auto py-4">
      {/* 1. Header / Manifesto Banner */}
      <section className="space-y-6 text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent)] bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
          Tôn chỉ xuất bản
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text-primary)] leading-[1.15] tracking-tight">
          Chia sẻ tri thức công nghệ với sự chuẩn xác và chiều sâu kỹ thuật.
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed font-normal">
          TechInsight là ấn phẩm công nghệ trực tuyến độc lập, ra đời với mục tiêu mang đến những bài viết có giá trị thực chất cho cộng đồng lập trình viên, kỹ sư hệ thống và những người đam mê công nghệ.
        </p>
      </section>

      {/* 2. Philosophy & Why We Exist */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 sm:p-10 shadow-[var(--shadow-subtle)] space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
          Vì sao TechInsight tồn tại?
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>
            Trong kỷ nguyên bùng nổ thông tin và nội dung do máy tạo tràn lan, chúng tôi nhận thấy các lập trình viên đang ngày càng mất nhiều thời gian để sàng lọc những bài viết chất lượng. Nhiều hướng dẫn chỉ dừng lại ở mức "Hello World", thiếu kinh nghiệm xử lý lỗi thực tế và bỏ qua các yếu tố trọng yếu như khả năng mở rộng hay bảo mật.
          </p>
          <p>
            TechInsight được xây dựng như một không gian đọc nghiêm túc, nơi tri thức kỹ thuật được chắt lọc từ những dự án sản xuất (production) thực tế. Chúng tôi tin rằng một bài viết hay không chỉ nói về việc công nghệ đó là gì, mà quan trọng hơn là lý do vì sao nên chọn nó và những đánh đổi kỹ thuật (trade-offs) đằng sau.
          </p>
        </div>
      </section>

      {/* 3. Four Core Technical Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Các Trụ Cột Tri Thức Cốt Lõi
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Nội dung xuất bản tại TechInsight tập trung vào 4 lĩnh vực trọng tâm
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-subtle)] hover:border-[var(--color-border-hover)] transition-all"
              >
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-brand-light)] text-[var(--color-brand)] flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Editorial Principles */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 sm:p-10 shadow-[var(--shadow-subtle)] space-y-6">
        <div className="border-b border-[var(--color-border)] pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Tiêu Chuẩn & Nguyên Tắc Biên Tập
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Bộ quy chuẩn đạo đức và tính liêm chính trong mỗi ấn phẩm được xuất bản
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {editorialPrinciples.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">
                  {item.rule}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Call to Explore & Connect */}
      <section className="text-center bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 sm:p-12 space-y-4">
        <HeartHandshake size={36} className="mx-auto text-[var(--color-brand)] opacity-80" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
          Cùng thảo luận và lan tỏa tri thức
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          Chúng tôi luôn sẵn sàng lắng nghe ý kiến phản biện của bạn trên từng bài viết hoặc kết nối trao đổi trực tiếp qua ban biên tập.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-xs font-semibold transition-colors"
          >
            <span>Khám phá các bài viết</span>
            <BookOpen size={14} />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text-primary)] transition-colors"
          >
            <span>Liên hệ tòa soạn</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
