import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BottomNav from "@/components/common/BottomNav";
import { getCategories } from "@/lib/api";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "TechInsight - Khám Phá Công Nghệ & Lập Trình Chuyên Sâu",
    template: "%s | TechInsight",
  },
  description: "Chia sẻ kiến thức công nghệ chuyên sâu, kỹ thuật lập trình web, kiến trúc phần mềm và xu hướng công nghệ mới nhất.",
  keywords: ["blog công nghệ", "lập trình web", "react", "next.js", "nodejs", "postgresql", "system design"],
  authors: [{ name: "TechInsight Team" }],
  openGraph: {
    title: "TechInsight - Khám Phá Công Nghệ & Lập Trình",
    description: "Chia sẻ kiến thức công nghệ chuyên sâu và kỹ thuật lập trình web hiện đại.",
    url: "/",
    siteName: "TechInsight Blog",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechInsight Blog",
    description: "Chia sẻ kiến thức công nghệ chuyên sâu và lập trình web.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const categoriesRes = await getCategories().catch(() => ({ data: [] }));
  const categories = categoriesRes?.data || [];

  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Anti-flicker script for dark mode from localStorage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('blog_theme');
                  const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--color-bg)] text-[var(--color-text-primary)] selection:bg-[var(--color-brand)] selection:text-white transition-colors duration-200">
        <Header categories={categories} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-20 md:pb-10">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
