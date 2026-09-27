# TechInsight - Nền Tảng Blog Công Nghệ Fullstack Hiện Đại

TechInsight là một nền tảng xuất bản blog công nghệ chuyên sâu, kiến trúc phân tầng (Clean Layered Architecture), tích hợp đầy đủ hệ sinh thái từ **Public Blog** chuẩn SEO, **Admin Portal** quản trị biên tập cao cấp, đến **RESTful Backend API** và cơ sở dữ liệu **PostgreSQL**.

---

## 🏛️ Kiến Trúc Hệ Thống

```text
BlogWeb/
├── src/                  # RESTful Backend API (Node.js + Express.js + PostgreSQL)
│   ├── config/           # Database Connection, Schema SQL, Migrations & Seed Data
│   ├── controllers/      # API Controllers
│   ├── middlewares/      # Authentication (JWT), Authorization (RBAC), Error Handler, Upload
│   ├── repositories/     # Data Access Layer (Parameterized SQL Queries)
│   ├── services/         # Core Business Logic & Orchestration
│   └── utils/            # Slugify, JWT Helpers, Formatters
├── admin/                # Admin Portal (React + Vite + TanStack Query v5 + Tailwind CSS)
│   ├── src/components/   # RichTextEditor, Post Management, Moderation Drawers, UI Components
│   ├── src/pages/        # Dashboard, Posts, Users, Comments, Categories, Contacts, Newsletter
│   └── src/hooks/        # Custom React Query Hooks
├── blog/                 # Public Blog (Next.js 16 + React 19 + Tailwind CSS v4 + App Router)
│   ├── src/app/          # SSR / ISR Routes (Home, /blog, /category/[slug], /search, /contact)
│   ├── src/components/   # PostCard, BlogFilterBar, CommentTree, NewsletterBox, Header, Footer
│   └── src/lib/          # API Client, Sanitization, Date Utilities
```

---

## ✨ Tính Năng Nổi Bật

### 1. Public Blog (Next.js 16 App Router)
- **Thiết kế Editorial Hiện đại**: Chuẩn thẩm mỹ báo chí công nghệ, Dark/Light mode linh hoạt.
- **Tối ưu SEO & Hiệu năng**: Incremental Static Regeneration (ISR 60s), OpenGraph metadata, Dynamic Sitemap, RSS feed (`/rss.xml`).
- **Bộ lọc & Sắp xếp Đa tiêu chí**: Sắp xếp theo Mới nhất, Cũ nhất, Xem nhiều nhất, Thảo luận nhiều; Lọc theo tuần, tháng, năm; Tìm kiếm trực tiếp; Đồng bộ URL Query String.
- **Hệ thống Bình luận Đa cấp (Nested Comments Tree)**: Hỗ trợ kiểm duyệt, bình luận cho khách (Guest comment), thu gọn nhánh phản hồi.
- **Newsletter & Liên hệ Tòa soạn**: Đăng ký nhận bản tin tự động, gửi ý kiến độc giả, form kiểm tra email chống spam.
- **Ghi nhận hành vi đọc (Read Depth Analytics)**: Tự động ghi nhận mức độ cuộn bài viết (25%, 50%, 75%, 100%) để đánh giá chất lượng nội dung.

### 2. Admin Portal (React + Vite + TanStack Query)
- **Tổng quan Dashboard & Thống kê Tương tác**: Biểu đồ bài viết thịnh hành, tỷ lệ đọc hết bài (Completion Rate), phân tích theo chuyên mục.
- **Quy trình Duyệt bài Phân quyền (Workflow State Machine)**:
  - `Draft` -> `Pending Review` (Gửi duyệt) -> `Published` (Phê duyệt) hoặc `Rejected` (Từ chối kèm lý do).
- **Bộ lọc & Sắp xếp Danh sách Bài viết**: Sắp xếp 4 tiêu chí, lọc thời gian theo preset & tùy chọn ngày, tìm kiếm phân trang server-side.
- **Soạn thảo Văn bản Giàu tính năng (RichTextEditor)**: Tùy chỉnh màu sắc, định dạng code block, danh sách, tải ảnh trực tiếp lên server.
- **Trung tâm Kiểm duyệt Bình luận (Comment Moderation Center)**: Duyệt hàng loạt, lọc bình luận spam/chờ duyệt, trả lời trực tiếp trong drawer.
- **Quản lý Người dùng & Phân cấp Vai trò (RBAC)**: `Super Admin`, `Admin`, `Editor`, `Author`, `User`.
- **Hộp thư Liên hệ & Quản trị Bản tin (Newsletter Subscriptions)**.

### 3. Backend API (Node.js + Express + PostgreSQL)
- **Kiến trúc Layered**: Tách biệt rõ ràng `Controller` -> `Service` -> `Repository`.
- **Bảo mật**: Xác thực JWT token, mã hóa mật khẩu bcrypt, chống SQL Injection với Parameterized Query, Rate limiting.
- **Gửi Email tự động**: Tích hợp Nodemailer gửi thông báo bài viết mới đến danh sách đăng ký bản tin.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu Tiên quyết
- **Node.js**: v18.0.0 trở lên
- **PostgreSQL**: v14 trở lên
- **npm** hoặc **yarn** / **pnpm**

### 2. Cài đặt Dependencies
Cài đặt các gói phụ thuộc cho cả 3 thành phần:
```bash
# Cài đặt Backend
npm install

# Cài đặt Admin Portal
cd admin && npm install && cd ..

# Cài đặt Public Blog
cd blog && npm install && cd ..
```

### 3. Cấu hình Biến Môi trường
Sao chép các tệp mẫu biến môi trường:
```bash
# Backend .env
cp .env.example .env

# Public Blog .env.local
cp blog/.env.local.example blog/.env.local
```
Chỉnh sửa thông tin kết nối PostgreSQL (Database Name, User, Password, Port) và JWT Secret trong file `.env`.

### 4. Khởi tạo Cơ sở Dữ liệu & Nạp Dữ liệu Mẫu (Seed Data)
Tạo cơ sở dữ liệu `blog_db` trong PostgreSQL, sau đó chạy:
```bash
# Khởi tạo schema và di chuyển bảng dữ liệu
npm run db:init

# Chạy seed dữ liệu mẫu phong phú (tác giả, chuyên mục, bài viết công nghệ, bình luận)
npm run seed
```

---

## 💻 Lệnh Chạy Dự Án (Development)

Bạn có thể mở 3 terminal độc lập để chạy 3 dịch vụ:

### Terminal 1: Backend API (Port 5000)
```bash
npm run dev
# Server lắng nghe tại http://localhost:5000/api
```

### Terminal 2: Admin Portal (Port 5173)
```bash
cd admin
npm run dev
# Mở trình duyệt tại http://localhost:5173
```
*Tài khoản đăng nhập quản trị mẫu:*
- **Super Admin**: `admin@techinsight.dev` / `Admin@123`
- **Editor**: `editor.hoang@techinsight.dev` / `Editor@123`
- **Author**: `author.minh@techinsight.dev` / `Author@123`

### Terminal 3: Public Blog (Port 3000)
```bash
cd blog
npm run dev
# Mở trình duyệt tại http://localhost:3000
```

---

## 📦 Lệnh Build Sản Phẩm (Production)

```bash
# Build Admin Portal
cd admin && npm run build

# Build Public Blog
cd blog && npm run build
```

---

## 📄 Bản Quyền & Giấy Phép
Dự án được phát triển phục vụ mục đích học tập, nghiên cứu và xây dựng hệ thống blog công nghệ chuyên nghiệp.
Mã nguồn phát hành theo giấy phép [MIT](LICENSE).
