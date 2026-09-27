# BLOG WEB PROJECT MAP & PROGRESS LOG

---

## 🗺️ TỔNG QUAN HỆ THỐNG 3 TẦNG (ARCHITECTURE OVERVIEW)

```
                       ┌──────────────────────────────────────────────┐
                       │           PostgreSQL Database (5432)         │
                       └──────────────────────┬───────────────────────┘
                                              │ Connection Pool (pg)
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │     Node.js / Express.js REST API (5000)     │
                       │   (JWT, RBAC, Slugs, Analytics, Security)   │
                       └──────────────┬───────────────────────────────┘
                                      │
              ┌───────────────────────┴────────────────────────┐
              ▼                                                ▼
┌───────────────────────────┐                    ┌───────────────────────────┐
│     React + Vite Admin    │                    │     Next.js Public Blog   │
│       CSR Portal          │                    │     SSR / ISR / SEO       │
│       (Port 5173)         │                    │       (Port 3000)         │
│                           │                    │                           │
│ • Quản lý Bài viết & Slug │                    │ • Trang chủ & Featured    │
│ • Quy trình Duyệt bài     │                    │ • Chi tiết bài viết SEO   │
│ • Quản lý Danh mục        │                    │ • JSON-LD & Open Graph    │
│ • Phân quyền 4 cấp User   │                    │ • XSS Sanitizer           │
│ • Content Performance     │                    │ • Đọc & Gửi Bình luận     │
│ • Read Depth Analytics    │                    │ • Sitemap & RSS Feed      │
│ • Light / Dark Mode & UI  │                    │ • Read Depth Tracker      │
└───────────────────────────┘                    └───────────────────────────┘
```

---

## 🟢 BÁO CÁO TIẾN ĐỘ GIAI ĐOẠN 1: BACKEND (COMPLETED 100%)

### 📁 Cấu Trúc Thư Mục Chuẩn Layered Architecture
```
BlogWeb/
├── .env                         # PORT=5000, DB Connection, JWT_SECRET
├── .gitignore                   # Ignore node_modules, .env, uploads
├── package.json                 # Dependencies & Scripts (dev, start, init-db)
├── PROJECT_MAP.md               # Bản đồ tiến độ & kiến trúc toàn dự án
└── src/
    ├── config/
    │   ├── db.js                # PostgreSQL Connection Pool (pg.Pool)
    │   ├── schema.sql           # DDL khởi tạo bảng users, categories, posts, comments
    │   ├── migrate_phase5.js    # Migration thêm status, rejection_reason, scroll depth
    │   └── initDb.js            # Script khởi tạo bảng vào CSDL (npm run init-db)
    ├── utils/
    │   └── slugify.js           # Helper chuyển tiếng Việt có dấu -> URL Slug chuẩn SEO
    ├── repositories/            # Tầng thao tác CSDL trực tiếp (Parameterized SQL)
    │   ├── userRepository.js    # SQL cho bảng users (findByEmail, create, updatePassword)
    │   ├── categoryRepository.js# SQL cho bảng categories (findAll, findBySlug, create, update, delete)
    │   ├── postRepository.js    # SQL cho bảng posts (Join categories/users, Phân trang, Search, Views)
    │   ├── commentRepository.js # SQL cho bảng comments (nested tree, guest comment, delete)
    │   └── analyticsRepository.js# SQL thống kê hiệu suất bài viết & read depth (25/50/75/100%)
    ├── services/                # Tầng xử lý Logic Nghiệp vụ & Validation
    │   ├── authService.js       # Register, Login, Bcrypt, Tạo JWT Token, Đổi mật khẩu
    │   ├── categoryService.js   # Tự động tạo slug, kiểm tra trùng lặp danh mục
    │   ├── postService.js       # Phân trang, slug, Phân quyền Admin/Editor/Author, Duyệt bài
    │   ├── commentService.js    # Nghiệp vụ bình luận của độc giả / admin
    │   └── analyticsService.js  # Tổng hợp KPI, top popular posts, phễu độ sâu đọc
    ├── middlewares/             # Tầng bảo vệ & Kiểm soát
    │   ├── authMiddleware.js    # Verify Bearer Token JWT, requireAdmin, requireStaff, optionalAuth
    │   └── uploadMiddleware.js  # Upload file ảnh qua Multer
    ├── controllers/             # Tầng xử lý HTTP Request / Response JSON
    │   ├── authController.js    # Handler Đăng ký, Đăng nhập, Profile, Đổi mật khẩu
    │   ├── categoryController.js# Handler CRUD Danh mục & Tìm theo Slug
    │   ├── postController.js    # Handler CRUD Bài viết, Slug, Like, Tăng view
    │   ├── commentController.js # Handler Đọc & Tạo bình luận (hỗ trợ độc giả & guest)
    │   └── analyticsController.js# Handler Dashboard Analytics & Ghi nhận Read Depth
    ├── routes/                  # Tầng định tuyến URL API
    │   ├── authRoutes.js        # /api/auth (register, login, me, change-password)
    │   ├── categoryRoutes.js    # /api/categories (slug/:slug, CRUD)
    │   ├── postRoutes.js        # /api/posts (/slug/:slug, like, phân trang, search, review)
    │   ├── commentRoutes.js     # /api/comments (post/:postId, tạo comment độc giả)
    │   ├── analyticsRoutes.js   # /api/analytics (kpis, top-popular, read-depth)
    │   └── userRoutes.js        # /api/users (danh sách & phân quyền thành viên)
    ├── app.js                   # Gom Middlewares toàn cục & Routes
    └── server.js                # Entry point lắng nghe Port 5000
```

---

## 📡 DANH SÁCH TOÀN BỘ API ENDPOINTS BACKEND

### 1. Auth Module (`/api/auth`)
| Method | Endpoint | Protection | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản (User / Author) |
| `POST` | `/api/auth/login` | Public | Đăng nhập nhận JWT Token |
| `GET` | `/api/auth/me` | Bearer JWT | Lấy thông tin user hiện tại |
| `PUT` | `/api/auth/profile` | Bearer JWT | Cập nhật thông tin cá nhân |
| `PUT` | `/api/auth/change-password`| Bearer JWT | Đổi mật khẩu (xác minh mật khẩu cũ qua Bcrypt) |

### 2. Category Module (`/api/categories`)
| Method | Endpoint | Protection | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Lấy danh sách tất cả danh mục kèm số lượng bài |
| `GET` | `/api/categories/slug/:slug` | Public | Lấy chi tiết danh mục theo Slug SEO |
| `GET` | `/api/categories/:id` | Public | Lấy chi tiết danh mục theo ID |
| `POST` | `/api/categories` | Admin JWT | Tạo danh mục mới |
| `PUT` | `/api/categories/:id` | Admin JWT | Cập nhật danh mục |
| `DELETE` | `/api/categories/:id` | Admin JWT | Xóa danh mục |

### 3. Post Module (`/api/posts`)
| Method | Endpoint | Protection | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | Lấy danh sách bài viết (Query: `status`, `page`, `limit`, `category`, `search`) |
| `GET` | `/api/posts/slug/:slug` | Public / Optional Auth | Xem chi tiết bài theo Slug (Chỉ trả bài `published` cho khách; tự động +1 view) |
| `GET` | `/api/posts/:id` | Public | Xem bài viết theo ID |
| `POST` | `/api/posts` | Bearer JWT | Tạo bài viết mới |
| `PUT` | `/api/posts/:id` | Author/Admin | Cập nhật bài viết |
| `PATCH` | `/api/posts/:id/review` | Editor/Admin | Phê duyệt hoặc từ chối bài viết (`published` / `rejected`) |
| `POST` | `/api/posts/:id/like` | Public | Tăng lượt yêu thích bài viết |
| `DELETE` | `/api/posts/:id` | Author/Admin | Xóa bài viết |

### 4. Comment Module (`/api/comments`)
| Method | Endpoint | Protection | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/comments` | Staff JWT | Lấy tất cả bình luận kèm quan hệ User và Post |
| `GET` | `/api/comments/post/:postId` | Public | Lấy cây bình luận thuộc về bài viết (bao gồm cả replies) |
| `POST` | `/api/comments` | Public / Optional Auth | Gửi bình luận cho bài viết (hỗ trợ độc giả vãng lai & thành viên đăng nhập) |
| `DELETE` | `/api/comments/:id` | Admin JWT | Xóa vĩnh viễn một bình luận |

### 5. Analytics & Performance Module (`/api/analytics`)
| Method | Endpoint | Protection | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/kpis` | Staff JWT | Lấy tổng lượt xem, tổng bài viết, tỷ lệ hoàn thành đọc trung bình |
| `GET` | `/api/analytics/top-popular` | Public / Staff | Top 5-10 bài viết có lượt đọc cao nhất kèm tỷ lệ đọc hết bài |
| `GET` | `/api/analytics/category-distribution`| Staff JWT | Phân bổ tỷ lệ bài viết và lượt xem theo danh mục |
| `POST` | `/api/analytics/read-depth` | Public | Beacon ghi nhận mốc cuộn trang của người đọc (25%, 50%, 75%, 100%) |

---

## 🟢 BÁO CÁO TIẾN ĐỘ GIAI ĐOẠN 2: REACT ADMIN PORTAL (COMPLETED 100%)

Thư mục: `admin/` (React 19 + Vite + Tailwind CSS + TanStack Query v5 + Lucide Icons)

- **Cấu trúc Route & Phân hệ Quản trị**:
  - `AdminLayout`: Sidebar thống nhất, nút chuyển chế độ Sáng / Tối (Light / Dark Mode) tinh gọn 32x32px, thẻ hồ sơ người dùng, nút Đăng xuất.
  - `/`: `DashboardOverview` (4 thẻ thống kê + 3 danh sách mới nhất Bài viết/Bình luận/Người dùng).
  - `/analytics`: `Analytics` (Hiệu suất nội dung: KPI cards, Bảng xếp hạng Top Popular Posts kèm tỷ lệ hoàn thành đọc Read Depth %, Biểu đồ phân bổ tỷ trọng danh mục, Modal phễu cuộn bài viết 25-50-75-100%).
  - `/posts`: `PostsManagement` (Bộ lọc 5 tabs trạng thái Tất cả/Chờ duyệt/Đã xuất bản/Bị từ chối/Bản nháp; tìm kiếm, modal Thêm/Sửa, nút xem chi tiết và quản lý bình luận `PostDetailModal`, quy trình phê duyệt & từ chối bài viết cho Editor/Admin).
  - `/categories`: `CategoriesManagement` (CRUD danh mục bài viết, slug tự động).
  - `/users`: `UsersManagement` (bảng thành viên, phân quyền đa cấp `super_admin`, `editor`, `author`, `user`, đếm số comment, modal hồ sơ và bình luận chi tiết).
  - `/comments`: `CommentsManagement` (trực quan hóa quan hệ **User → Comment → Post**, xóa comment vi phạm).
  - `/profile`: `Profile` (Hồ sơ cá nhân & Đổi mật khẩu bảo mật: kiểm tra mật khẩu hiện tại, mật khẩu mới, băm mật khẩu bằng Bcrypt).
- **Trải nghiệm Giao diện**:
  - Hỗ trợ toàn diện **Light Mode** & **Dark Mode** mượt mà, văn bản tương phản rõ ràng không bị chìm màu.
  - Thanh cuộn **Custom Scrollbar** bo tròn 6px đồng bộ cho toàn bộ hệ thống.
  - **TanStack Query v5**: Tự động Invalidate queries thời gian thực khi thêm, sửa, xóa mà không cần reload trang.

---

## 🟢 BÁO CÁO TIẾN ĐỘ GIAI ĐOẠN 3: FRONTEND PUBLIC BLOG (NEXT.JS 16 APP ROUTER - COMPLETED 100%)

Thư mục: `blog/` (Next.js 16.3 + React 19 + Tailwind CSS v4 + Lucide Icons + Sanitize HTML)

### 📁 Cấu Trúc Thư Mục Public Blog Frontend
```
blog/
├── .env.local                   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
├── next.config.mjs              # remotePatterns cho ảnh uploads từ backend & domain ngoài
├── package.json                 # Next.js 16, lucide-react, sanitize-html, tailwindcss v4
└── src/
    ├── app/
    │   ├── layout.js            # Root layout: Inter font, SEO meta base, Header, Footer, Dark mode
    │   ├── page.js              # Trang chủ: Featured Hero, Categories bar, Latest posts grid, Top Read sidebar
    │   ├── loading.js           # Skeleton loading state
    │   ├── not-found.js         # Trang 404 thân thiện, nút điều hướng về trang chủ
    │   ├── error.js             # Error boundary client-side với nút thử lại
    │   ├── globals.css          # CSS Variables, Custom scrollbar, Typography prose
    │   ├── robots.js            # Trình tạo robots.txt cho Googlebot & AI crawlers
    │   ├── sitemap.js           # Dynamic sitemap.xml tự động sinh URL từ API bài viết & chuyên mục
    │   ├── rss.xml/
    │   │   └── route.js         # Dynamic RSS 2.0 XML feed cho độc giả & reader app
    │   ├── blog/
    │   │   ├── page.js          # Danh sách toàn bộ bài viết có phân trang (?page=x) & bộ lọc
    │   │   └── [slug]/
    │   │       └── page.js      # Trang chi tiết bài viết (SSR/ISR, dynamic metadata, JSON-LD schema)
    │   ├── category/
    │   │   └── [slug]/
    │   │       └── page.js      # Trang chuyên mục bài viết theo danh mục & phân trang
    │   └── search/
    │       └── page.js          # Trang tìm kiếm bài viết theo từ khóa
    ├── components/
    │   ├── common/
    │   │   ├── Header.jsx       # Header: Logo gradient, Navigation links, Theme Toggle, Search trigger, Mobile Drawer
    │   │   └── Footer.jsx       # Footer: Giới thiệu blog, liên kết điều hướng, Admin portal shortcut, bản quyền
    │   └── blog/
    │       ├── PostCard.jsx     # Card bài viết: thumbnail, tag, tiêu đề, tóm tắt, tác giả, ngày đăng, lượt xem, thời gian đọc
    │       ├── FeaturedHero.jsx # Banner bài viết nổi bật: typography lớn, ảnh cover, tóm tắt, nút Đọc tiếp
    │       ├── CategoryFilter.jsx # Thanh danh mục dạng pill cuộn ngang mượt mà
    │       ├── ReadingProgressBar.jsx # Thanh tiến độ đọc bài mượt mà ở mép trên màn hình
    │       ├── LikeButton.jsx   # Nút thả tim bài viết, lưu local state & đồng bộ API
    │       ├── ShareButtons.jsx # Nút chia sẻ Facebook, Twitter, sao chép liên kết vào clipboard
    │       ├── CommentSection.jsx # Khối bình luận: phân cấp reply, gửi bình luận độc giả & thành viên
    │       └── ScrollTracker.jsx # Client beacon theo dõi mốc đọc 25%, 50%, 75%, 100% gửi về backend
    └── lib/
        ├── api.js               # Server & Client fetch wrapper kết nối Backend Express API
        ├── sanitize.js          # Bộ lọc an toàn HTML XSS với sanitize-html (hỗ trợ code, pre, table, img)
        └── utils.js             # Format ngày tiếng Việt, tính thời gian đọc (WPM), trích đoạn, xử lý URL ảnh
```

### Chi Tiết Hoàn Thành 8 Phase Của Public Blog:

1. **Phase 1: Nền tảng & Layout**:
   - Khởi tạo Next.js 16.3 với Turbopack, Tailwind CSS v4, font Inter.
   - Header linh hoạt với popup tìm kiếm nhanh, dark mode toggle tức thời, menu trượt trên thiết bị di động.
   - Layout toàn diện tích hợp Header, Footer, Error Boundary, Loading Skeletons, 404 page.

2. **Phase 2: Trang Chủ & Danh Sách Bài Viết**:
   - Trang chủ (`/`): Banner bài viết nổi bật (Featured Hero), thanh danh mục chủ đề, lưới bài mới nhất (PostCard), sidebar "Đọc nhiều nhất" (Top Popular) và form đăng ký bản tin.
   - Trang bài viết (`/blog`): Phân trang chuẩn xác (`?page=1, 2...`), bộ lọc chuyên mục, đếm số lượng bài.

3. **Phase 3: Chi Tiết Bài Viết Chuẩn SEO**:
   - Đường dẫn chuẩn SEO: `/blog/[slug]`.
   - `generateMetadata`: Tự động sinh `title`, `description`, thẻ meta `article:published_time`, `article:author`, Open Graph Image kích thước 1200x630.
   - JSON-LD Structured Data: Nhúng Schema `BlogPosting` chuẩn định dạng Google Search Rich Snippets.
   - Thanh tiến độ đọc (`ReadingProgressBar`), tính thời gian đọc ước tính theo số từ tiếng Việt.
   - Chống tấn công XSS tuyệt đối qua `sanitize-html` cho nội dung HTML từ bộ soạn thảo bài viết.
   - Tự động gợi ý 3 bài viết liên quan cùng chuyên mục.

4. **Phase 4: Trang Chuyên Mục & Tìm Kiếm**:
   - Trang chuyên mục: `/category/[slug]` hiển thị mô tả chuyên mục, danh sách bài viết theo danh mục kèm phân trang.
   - Trang tìm kiếm: `/search?q=...` tra cứu tức thì theo tiêu đề và nội dung bài viết, trạng thái kết quả trực quan.

5. **Phase 5: SEO, Sitemap, Robots & RSS**:
   - `sitemap.xml`: Tự động quét toàn bộ bài viết đã xuất bản và chuyên mục để tạo sitemap động phục vụ Google Search Console.
   - `robots.txt`: Khai báo quy tắc thu thập dữ liệu và trỏ đường dẫn tới `sitemap.xml`.
   - `rss.xml`: Cung cấp nguồn cấp RSS 2.0 chuẩn cho độc giả đăng ký qua các ứng dụng đọc tin (Feedly, Apple News, v.v.).

6. **Phase 6: Tương Tác Độc Giả (Comments, Like, Share)**:
   - Bình luận phân cấp: Độc giả vãng lai hoặc thành viên có thể gửi bình luận trực tiếp, hỗ trợ trả lời theo luồng (threaded replies).
   - Tương tác nhanh: Nút Thích bài viết (`LikeButton`) với cập nhật tức thời (Optimistic UI) và Nút Chia sẻ đa nền tảng (`ShareButtons`).

7. **Phase 7: Phân Tích Độ Sâu Đọc (Read Depth Analytics)**:
   - `ScrollTracker`: Tự động tính toán tỷ lệ cuộn trang của người đọc và gửi beacon phân tích tại các mốc 25%, 50%, 75%, 100% về endpoint `/api/analytics/read-depth`.
   - Dữ liệu này được đồng bộ trực tiếp lên trang Analytics của Admin Portal để biên tập viên nắm bắt độ gắn kết của độc giả với bài viết.

8. **Phase 8: Kiểm Thử Toàn Diện & Tính Độc Lập**:
   - 3 phân hệ (Backend Express, Admin React/Vite, Public Blog Next.js) hoạt động hoàn toàn độc lập, tách biệt cổng (Ports 5000, 5173, 3000), kết nối bảo mật qua REST API.

---

## 💎 BẢNG CHUẨN HÓA THIẾT KẾ ĐỘC BẢN (EDITORIAL PRODUCT UPGRADE)
*Kế hoạch kiến trúc đã được phê duyệt tại: [public_blog_editorial_upgrade_plan.md](file:///C:/Users/ADMIN/.gemini/antigravity-ide/brain/c8706191-e85f-4c11-93bc-8e36d7200a5f/public_blog_editorial_upgrade_plan.md)*

### Các cải tiến lớn đã triển khai:
1. **Design Tokens Nhất Quán**:
   - Khai báo biến CSS `--color-bg`, `--color-surface`, `--color-surface-muted`, `--color-border`, `--color-brand`, `--color-accent`, `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), `--shadow-subtle` cho cả Light và Dark Mode.
   - Loại bỏ toàn bộ các lớp màu hardcode ngẫu nhiên và bo góc quá khổ 24px-32px.
2. **Loại bỏ "AI Template / Generic Dashboard"**:
   - Xóa bỏ hoàn toàn hiệu ứng nhảy co giật `hover:scale-105` trên card bài viết; chuyển sang hiệu ứng vi mô đổi màu chữ sang Brand Indigo nhẹ nhàng.
   - Thiết kế lại PostCard phẳng, có hairline border và nhãn danh mục đặt phía trên tiêu đề thanh thoát.
3. **Chuẩn Hóa Header & Footer Độc Giả**:
   - **Xóa bỏ triệt để liên kết "Admin Portal"** ở cả Header và Footer của Public Blog để bảo vệ ranh giới bảo mật và trải nghiệm người đọc.
   - Thêm component [ThemeToggle.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/common/ThemeToggle.jsx) trực quan trên thanh điều hướng.
   - Xây dựng component [MobileDrawer.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/common/MobileDrawer.jsx) trượt mượt mà có backdrop mờ và khóa cuộn body (`body.style.overflow = 'hidden'`) khi mở menu trên điện thoại.
4. **Tối Ưu Trải Nghiệm Đọc Bài Viết (Reading Experience)**:
   - Thu hẹp khung bài đọc từ `max-w-4xl` (896px) về **`max-w-[720px]`** căn giữa chuẩn mực báo chí (65–75 ký tự/dòng), chống mỏi mắt.
   - Giảm độ dày thanh tiến độ đọc [ReadingProgressBar.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/ReadingProgressBar.jsx) xuống **2.5px** tinh tế.
   - Lớp kiểu chữ `.prose-editorial` với khoảng cách dòng 1.85, blockquote viền trái 3px, khối code hairline viền mảnh.
5. **Kiến Trúc Tải Ảnh Nội Dung Bài Viết (Image Upload Pipeline)**:
   - Tùy biến nút ảnh trên [RichTextEditor.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/components/editor/RichTextEditor.jsx) (Admin): Tự động upload tệp ảnh qua API `POST /api/upload`, lưu tệp vào thư mục máy chủ và chèn URL sạch `http://localhost:5000/uploads/img-xxx.jpg`. **Xóa bỏ hoàn toàn tình trạng nhồi chuỗi Base64 hàng triệu ký tự làm phình to CSDL PostgreSQL**.
---

## 🌳 BẢNG NÂNG CẤP HỆ THỐNG COMMENT CÂY PHÂN CẤP (THREADED COMMENT TREE)
*Kế hoạch kiến trúc đã được phê duyệt tại: [comment_system_upgrade_plan.md](file:///C:/Users/ADMIN/.gemini/antigravity-ide/brain/c8706191-e85f-4c11-93bc-8e36d7200a5f/comment_system_upgrade_plan.md)*

### 1. Cơ sở dữ liệu (PostgreSQL)
- Đã chạy migration [migrate_comments_tree.js](file:///d:/ProjectWeb/BlogWeb/src/config/migrate_comments_tree.js):
  - Bổ sung cột `parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE` (Hỗ trợ phân cấp cha - con vô hạn tầng, tự động dọn dẹp khi comment cha bị xóa).
  - Bổ sung cột `status VARCHAR(20) DEFAULT 'approved'`.
  - Tạo chỉ mục tăng tốc độ truy vấn: `idx_comments_parent_id` và `idx_comments_post_status`.

### 2. Backend Layer (Repository - Service - Controller)
- **SQL Tối ưu (Zero N+1 Query)**: [commentRepository.js](file:///d:/ProjectWeb/BlogWeb/src/repositories/commentRepository.js) chỉ thực hiện **1 câu truy vấn SQL duy nhất** gom toàn bộ comment đã duyệt của bài viết:
  ```sql
  SELECT c.id, c.content, c.created_at, c.post_id, c.user_id, c.parent_id, c.status,
         u.username, u.email, u.avatar, u.role
  FROM comments c
  JOIN users u ON c.user_id = u.id
  WHERE c.post_id = $1 AND c.status = 'approved'
  ORDER BY c.created_at ASC
  ```
- **Xác thực An toàn Nghiệp vụ**: [commentService.js](file:///d:/ProjectWeb/BlogWeb/src/services/commentService.js) kiểm tra nghiêm ngặt `parent_id`:
  - Đảm bảo comment cha tồn tại và thuộc đúng `post_id` (chống tấn công reply chéo bài viết - Cross-post reply injection).
- **Hỗ trợ Khách & Thành viên**: [commentController.js](file:///d:/ProjectWeb/BlogWeb/src/controllers/commentController.js) hỗ trợ cả khách vãng lai và thành viên đã đăng nhập.

### 3. Frontend Next.js Public Blog
- **Thuật toán Chuyển đổi Cây & Đếm Phản hồi $O(N)$**: [commentTree.js](file:///d:/ProjectWeb/BlogWeb/blog/src/lib/commentTree.js)
  - Sử dụng Hash Map `idMap` và 2 lượt lặp tuyến tính biến danh sách phẳng từ API thành cấu trúc cây lồng nhau `replies: []`.
  - Hàm đệ quy `countTotalReplies(comment)` tính toán chính xác tổng số lượng bình luận con cháu trong toàn bộ nhánh.
- **Thành phần Bình luận Đệ quy & Đóng/Mở Linh hoạt (Collapsible Branch UX)**: [CommentItem.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/CommentItem.jsx)
  - Hiển thị trực quan: Avatar, Họ tên, Nhãn huy hiệu `Quản trị viên` / `Tác giả`, thời gian đăng bài tiếng Việt.
  - Đường kẻ chỉ dẫn dọc (Vertical Hairline Connector) kết nối luồng đàm thoại.
  - **Giới hạn Thụt lề An toàn Di động (Mobile-friendly Depth Capping)**: Thụt lề ở cấp 1 và cấp 2, từ cấp 3 trở đi giữ nguyên độ rộng để tránh làm văn bản bị bóp méo trên màn hình điện thoại 375px.
  - **Quy tắc Gom Tầng Thông Minh (Depth-based Folding)**:
    - Bình luận gốc (Depth 0): Mặc định mở nếu $\le 2$ replies, gom lại nếu $\ge 3$ replies.
    - Cấp 1 (Depth 1): Gom lại nếu có nhiều phản hồi con.
    - Cấp 2 trở đi (Depth $\ge 2$ - Tầng 3+): **Luôn luôn mặc định thu gọn**, hiển thị nút `[ ▾ Xem X phản hồi lồng nhau ]`.
    - Nút `[ ▴ Thu gọn X phản hồi ]` cho phép người đọc gập nhánh lại khi đọc xong.
    - Tự động mở nhánh (`isExpanded = true`) khi người dùng bấm `[Trả lời]` hoặc gửi phản hồi mới thành công.
- **Form Trả lời Ngay Tại Chỗ (Inline Reply UX)**: [CommentReplyForm.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/CommentReplyForm.jsx)
  - Hiển thị **ngay dưới bình luận mục tiêu**, xóa bỏ hoàn toàn hiện tượng cuộn giật lên đầu trang làm mất dấu cuộc trò chuyện.
  - Tự động Focus vào khung nhập liệu, hỗ trợ phím `Escape` để đóng form nhanh.
  - Huy hiệu ngữ cảnh: `↳ Đang trả lời [Tác giả bình luận]`.
  - Chống Double-submit và ghi nhớ thông tin độc giả (Họ tên, Email) qua `localStorage`.
- **Quản lý Luồng Bình luận**: [CommentSection.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/CommentSection.jsx)
  - Quản lý trạng thái `activeReplyId` duy nhất, tự động tải lại cây bình luận sau khi gửi phản hồi thành công.

---

## 🌱 HỆ THỐNG DỮ LIỆU MẪU CHUẨN HÓA (SEED DATA SYSTEM)
*Kế hoạch kiến trúc đã được phê duyệt tại: [seed_data_plan.md](file:///C:/Users/ADMIN/.gemini/antigravity-ide/brain/c8706191-e85f-4c11-93bc-8e36d7200a5f/seed_data_plan.md)*

### 1. Tệp thực thi & Lệnh chạy
- Tệp nguồn: [src/config/seed.js](file:///d:/ProjectWeb/BlogWeb/src/config/seed.js)
- Lệnh chạy: `npm run seed`
- Đặc tính: **Idempotent** (chạy lại nhiều lần an toàn, sử dụng `ON CONFLICT DO UPDATE`), chạy toàn bộ trong một Transaction an toàn (`BEGIN ... COMMIT / ROLLBACK`).

### 2. Danh sách tài khoản thử nghiệm (Development Test Accounts)
> **Mật khẩu chung cho tất cả tài khoản**: `Password123@`

| Vai trò (Role) | Email | Username | Mục đích kiểm thử |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@blog.local` | `admin_baon` | Toàn quyền quản trị, duyệt bài, phân quyền, xem Analytics |
| **Editor** | `editor1@blog.local` | `editor_hoang` | Biên tập viên duyệt bài viết (Publish / Reject có lý do) |
| **Editor** | `editor2@blog.local` | `editor_thuydung` | Biên tập viên kiểm tra phân quyền nội dung |
| **Author** | `author1@blog.local` | `author_minhduc` | Tác giả viết bài, nộp duyệt, quản lý "Bài viết của tôi" |
| **Author** | `author2@blog.local` | `author_thanhnga` | Tác giả xem lý do bị từ chối và sửa bài |
| **Reader / User**| `reader1@blog.local` | `quanghuy_dev` | Độc giả tương tác, thích bài, thảo luận |
| **Reader / User**| `reader2@blog.local` | `nguyenmai_tech` | Độc giả tham gia cây bình luận phản hồi lồng sâu |
| **Reader / User**| `reader3@blog.local` | `tuananh_frontend` | Độc giả tương tác bình luận chuyên sâu |
| **Reader / User**| `reader4@blog.local` | `thuha_cloud` | Độc giả tương tác bài viết Cloud & DevOps |
| **Reader / User**| `reader5@blog.local` | `vietdung_backend`| Độc giả tương tác bài viết Database & Node.js |
| **Reader / User**| `reader6@blog.local` | `huonggiang_ui` | Độc giả tương tác bài viết UI/UX Design |

### 3. Khối lượng dữ liệu đã khởi tạo
- **11 Tài khoản mẫu** đầy đủ 4 vai trò kèm ảnh avatar Unsplash chân dung cao cấp.
- **8 Danh mục chuyên môn** chuẩn SEO: JavaScript, React, Next.js, Node.js, Database, DevOps, Web Performance, UI/UX.
- **20 Bài viết kỹ thuật phong phú**:
  - 14 bài `published` với ngày xuất bản rải rác trong 60 ngày gần đây, định dạng nội dung phong phú (Heading H2/H3, code blocks, quote, ảnh).
  - 3 bài `pending` (để kiểm tra quy trình duyệt bài ở Admin).
  - 2 bài `draft` (để kiểm tra bản nháp của tác giả).
  - 1 bài `rejected` (kèm lý do từ chối cụ thể để kiểm tra luồng phản hồi).
- **Cây bình luận đa tầng**: Nhánh bình luận sâu 4 tầng (Depth 0 $\to$ Depth 3) để kiểm tra tính năng đóng/mở tầng `[ Xem X phản hồi ]`.
- **Dữ liệu phân tích tương tác**:
  - Lượt xem từ 90 đến 5,420 views (phân phối Power Law thực tế).
  - Bảng `post_likes` đồng bộ với từng user.
  - Bảng `post_read_depth` với đầy đủ phễu 25%, 50%, 75%, 100% và tỷ lệ hoàn thành trung bình 28%.

---

## 🛠️ CẢI TIẾN TRẢI NGHIỆM & SỬA LỖI (BUG FIXES & UX ENHANCEMENTS)

### 1. Khắc phục lỗi Từ chối bài viết (Post Rejection Bug)
- **Vấn đề**: Khi bấm từ chối bài viết trên Admin Portal, PostgreSQL trả về lỗi `inconsistent types deduced for parameter $1` do câu truy vấn prepared statement dùng nhiều mệnh đề `CASE` với giá trị `null` và tái sử dụng cùng tham số `$1`.
- **Khắc phục**:
  - Tối ưu hóa hàm `updateStatus` trong [src/repositories/postRepository.js](file:///d:/ProjectWeb/BlogWeb/src/repositories/postRepository.js): Xây dựng câu lệnh SQL cập nhật trạng thái động, gán giá trị tham số trực tiếp, loại bỏ hoàn toàn các mệnh đề `CASE` mơ hồ.
  - Nâng cấp [admin/src/pages/PostsManagement.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/pages/PostsManagement.jsx): Thay thế popup `window.prompt` bằng **Modal Từ chối bài viết (RejectModal)** chuyên nghiệp với textarea nhập lý do, cảnh báo rõ ràng và kiểm tra xác thực trước khi gửi.

### 2. Nâng cấp thanh cuộn danh mục bằng Thư viện Swiper (Category Slider)
- **Vấn đề**: Trên Public Blog có nhiều chuyên mục (9 danh mục) nhưng thanh lọc danh mục bị ẩn thanh cuộn và chuột máy tính thông thường (chỉ có con lăn dọc) không thể cuộn ngang sang các chuyên mục phía sau.
- **Khắc phục**:
  - Cài đặt thư viện **Swiper** (`swiper/react`, `swiper/modules`).
  - Nâng cấp [blog/src/components/blog/CategoryFilter.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/CategoryFilter.jsx):
    - Tích hợp module `FreeMode` (lướt mượt mà) và `Mousewheel` với `forceToAxis: true` (tự động chuyển con lăn chuột dọc thành cuộn ngang).
    - Thêm 2 nút bấm điều hướng mũi tên `[ ‹ ]` và `[ › ]` ở 2 đầu thanh danh mục (tự động ẩn/hiện thông minh khi chạm điểm đầu hoặc điểm cuối).
    - Cập nhật wrapper trong [blog/src/app/page.js](file:///d:/ProjectWeb/BlogWeb/blog/src/app/page.js) với `min-w-0 flex-1 w-full overflow-hidden` để Swiper co giãn mượt mà trên mọi kích thước màn hình.

### 3. Nâng cấp Trung Tâm Kiểm Duyệt Bình Luận (Comment Moderation Center)
- **Vấn đề**: Giao diện Quản lý Bình luận cũ chỉ là một danh sách phẳng đơn điệu, không thể hiện được luồng hội thoại phân cấp cha-con (Threaded Tree), không có hàng đợi kiểm duyệt ưu tiên các bình luận chưa phê duyệt (`pending` / `hidden`), và khó quản lý theo từng bài viết.
- **Khắc phục toàn diện 3 tầng**:
  - **Database Indexing**:
    - Tạo composite index `idx_comments_status_created` trên `comments(status, created_at DESC)`.
    - Tạo composite index `idx_comments_post_created` trên `comments(post_id, created_at DESC)`.
  - **Backend API & Service**:
    - [src/repositories/commentRepository.js](file:///d:/ProjectWeb/BlogWeb/src/repositories/commentRepository.js): Bổ sung `getStats()`, `findPendingComments()`, `countPendingComments()`, `findPostCommentGroups()`, `countPostCommentGroups()`, `findAdminByPostId()`, `updateStatus()`.
    - [src/services/commentService.js](file:///d:/ProjectWeb/BlogWeb/src/services/commentService.js) & [src/controllers/commentController.js](file:///d:/ProjectWeb/BlogWeb/src/controllers/commentController.js): Cung cấp các service nghiệp vụ và handler kiểm duyệt.
    - [src/routes/commentRoutes.js](file:///d:/ProjectWeb/BlogWeb/src/routes/commentRoutes.js): Khai báo các endpoint bảo mật với RBAC (`requireEditorOrAbove`):
      - `GET /api/comments/stats`: KPI số liệu tổng quan.
      - `GET /api/comments/pending`: Action Queue bình luận cần xử lý.
      - `GET /api/comments/by-post`: Thống kê bình luận theo bài viết.
      - `GET /api/comments/post/:id/admin`: Lấy toàn bộ cây hội thoại (bao gồm cả `pending`, `approved`, `hidden`).
      - `PATCH /api/comments/:id/status`: Cập nhật trạng thái duyệt/ẩn bình luận.
  - **Frontend Admin Portal (React + TanStack Query)**:
    - [admin/src/services/index.js](file:///d:/ProjectWeb/BlogWeb/admin/src/services/index.js) & [admin/src/hooks/useComments.js](file:///d:/ProjectWeb/BlogWeb/admin/src/hooks/useComments.js): Tích hợp đầy đủ query hooks và mutation tự động invalidate cache tức thì.
    - [admin/src/components/comments/ThreadInspectorDrawer.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/components/comments/ThreadInspectorDrawer.jsx): Slide-over drawer hiển thị cây hội thoại đệ quy trực quan với đầy đủ thao tác kiểm duyệt Duyệt / Ẩn / Xóa ngay trên từng nút nhánh.
    - [admin/src/pages/CommentsManagement.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/pages/CommentsManagement.jsx): Thiết kế lại theo chuẩn Editorial Moderation Center:
      1. **Thanh KPI Top Bar**: Tổng bình luận, Cần xử lý (Pending alert), Đã duyệt, Đã ẩn, Tương tác hôm nay.
      2. **Tab 1 - Cần xử lý (Action Queue)**: Tập trung xử lý nhanh các bình luận độc giả gửi đến đang chờ phê duyệt.
      3. **Tab 2 - Theo bài viết (Group by Post)**: Xem bài viết nào đang có thảo luận sôi nổi và số lượng bình luận chờ duyệt của từng bài.
      4. **Tab 3 - Tất cả & Tra cứu (All Table)**: Bộ lọc theo trạng thái (`approved`, `pending`, `hidden`) và tìm kiếm từ khóa thời gian thực.

### 4. Khắc phục lỗi Mobile Drawer (Containing Block Trap) & Thanh điều hướng Bottom Navigation
- **Vấn đề**: Menu hamburger trên thiết bị di động khi mở ra chỉ chiếm chiều cao khoảng 64px của thanh navbar thay vì phủ trọn màn hình, danh mục không hiển thị, và menu bị vỡ khi cuộn.
- **Nguyên nhân kỹ thuật**: Thuộc tính CSS `backdrop-filter: blur(...)` trên thẻ `<header>` tạo ra một **Containing Block** mới theo chuẩn W3C, khiến các phần tử con có `position: fixed` bị giới hạn trong khung của header (64px) thay vì viewport màn hình.
- **Khắc phục**:
  - Tách [blog/src/components/common/MobileDrawer.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/common/MobileDrawer.jsx) sang sử dụng React Portal (`createPortal(drawerJSX, document.body)`) để đưa drawer ra ngoài phạm vi layout của header, phủ trọn toàn màn hình (`100dvh`).
  - Nâng cấp [blog/src/app/layout.js](file:///d:/ProjectWeb/BlogWeb/blog/src/app/layout.js) lấy danh sách categories từ backend và truyền vào `<Header categories={categories} />` giúp Drawer hiển thị đầy đủ các chuyên mục.
  - Xây dựng thanh điều hướng [blog/src/components/common/BottomNav.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/common/BottomNav.jsx) gắn cố định đáy màn hình trên mobile với 4 nút truy cập nhanh: Trang chủ, Bài viết, Tìm kiếm và Chủ đề.

### 5. Tích hợp Taste Skill, Editorial Redesign & 2 Trang Mới (/about, /contact)
- **Tích hợp Taste Skill**:
  - Cài đặt 2 kỹ năng cốt lõi từ `Leonxlnx/taste-skill` vào thư mục `.agents/skills/`:
    - [design-taste-frontend](file:///d:/ProjectWeb/BlogWeb/.agents/skills/design-taste-frontend/SKILL.md)
    - [redesign-existing-projects](file:///d:/ProjectWeb/BlogWeb/.agents/skills/redesign-existing-projects/SKILL.md)
  - Xác lập 3 thông số định hướng thiết kế (The Three Dials):
    - `DESIGN_VARIANCE: 6` (Medium - Thể hiện rõ bản sắc tòa soạn báo công nghệ uy tín, khác biệt với Tailwind template mặc định).
    - `MOTION_INTENSITY: 4` (Low-Medium - Chuyển động tinh tế, micro-interactions êm dịu, không giật lag).
    - `VISUAL_DENSITY: 3` (Airy, Content-first - Tập trung tối đa vào trải nghiệm đọc bài, khoảng cách thoáng đãng, tỉ lệ typography vàng).
- **Hệ thống Design Tokens "Ink & Paper"**:
  - Cập nhật [blog/src/app/globals.css](file:///d:/ProjectWeb/BlogWeb/blog/src/app/globals.css):
    - Nền giấy ấm: `#fafaf9` (Light) / `#090d16` (Deep Ink Dark).
    - Chữ tương phản cao: `#0c0a09` (Light) / `#f8fafc` (Dark).
    - Điểm nhấn tòa soạn: Deep Indigo (`#1e1b4b` / `#818cf8`) & Amber Bookmark (`#b45309`).
    - Viền hairline tinh tế (`border-stone-200/80` & `border-slate-800/80`).
    - Áp dụng `text-wrap: balance` cho tiêu đề và `text-wrap: pretty` cho đoạn văn bản để ngăn ngừa góa chữ (widow words).
- **Redesign Toàn Diện Các Thành Phần Public Blog**:
  - **Header & Footer**: Logo TechInsight ấn tượng với huy hiệu "EST. 2026 / TECH JOURNAL", phân bổ menu điều hướng rõ ràng, liên kết trực tiếp tới `/about` và `/contact`.
  - **Featured Hero**: Tiêu đề lớn hiển thị dạng Lead Story tòa soạn, gắn thẻ danh mục và số liệu lượt đọc `tabular-nums`.
  - **Trang Tìm kiếm (/search)**: Thanh tìm kiếm nổi bật với các gợi ý chủ đề nhanh (chips) và giao diện kết quả chuẩn editorial.
- **Bổ sung 2 Trang Mới Hoàn Chỉnh**:
  - **Trang Giới Thiệu ([blog/src/app/about/page.js](file:///d:/ProjectWeb/BlogWeb/blog/src/app/about/page.js))**: Tuyên ngôn biên tập (Editorial Manifesto), lý do TechInsight ra đời, 4 trụ cột kỹ thuật (Core Pillars) và nguyên tắc đạo đức nghề nghiệp.
  - **Trang Liên Hệ ([blog/src/app/contact/page.js](file:///d:/ProjectWeb/BlogWeb/blog/src/app/contact/page.js))**: Tích hợp form liên hệ hoàn chỉnh [blog/src/components/blog/ContactForm.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/ContactForm.jsx) với validation, lựa chọn chủ đề gửi, thông báo phản hồi và fallback `mailto:`.
  - Cập nhật [blog/src/app/sitemap.js](file:///d:/ProjectWeb/BlogWeb/blog/src/app/sitemap.js) bổ sung `/about` và `/contact` chuẩn SEO.

### 6. Redesign Admin Dashboard theo Taste Skill: Editorial Command Center
- **Mục tiêu**: Biến bảng điều khiển quản trị từ 4 ô số liệu thô kiểu AI template thành một **Trung Tâm Chỉ Huy Biên Tập (Editorial Mission Control)** có tính hành động cao, cảnh báo tức thì và số liệu rõ ràng.
- **Áp dụng Taste Skill**:
  - `DESIGN_VARIANCE: 4` (Kỷ luật cấu trúc cao, bố cục chuẩn mực giúp xử lý thông tin nhanh).
  - `MOTION_INTENSITY: 3` (Chuyển động tinh tế, micro-interactions 150ms êm dịu, không giật lag).
  - `VISUAL_DENSITY: 5` (Mật độ thông tin tối ưu, sử dụng `font-mono tracking-tight tabular-nums` và viền hairline).
- **Các thành phần được triển khai**:
  1. **Header & Editorial Context**: Lời chào cá nhân hóa theo thời gian trong ngày (`Chào buổi sáng / Buổi chiều`), trạng thái hệ thống và các nút tắt thao tác nhanh (`+ Soạn bài viết mới`, `Phân tích hiệu suất`).
  2. **Hàng Đợi Biên Tập Cần Xử Lý (Action Required Hub)**: Tự động xuất hiện thẻ cảnh báo khi có bài viết hoặc bình luận chờ duyệt, kèm nút điều hướng 1-click trực tiếp tới đúng mục cần xử lý.
  3. **Lưới Chỉ Số Vital Signs (4 Metrics Panels)**:
     - Xuất bản nội dung: Số bài đã xuất bản, bản nháp, tổng chuyên mục.
     - Hàng đợi kiểm duyệt: Số bài chờ duyệt, số bình luận chờ duyệt.
     - Cộng đồng & Thảo luận: Tổng bình luận, tổng thành viên, tổng lượt thích.
     - Sức khỏe đọc bài: Tổng lượt xem, tỷ lệ đọc hết nội dung trung bình (`avgCompletionRate`).
  4. **Bố Cục Hai Cột Split Deck**:
     - *Cột Trái (Luồng bài viết mới)*: Bổ sung nhãn trạng thái chính xác (`Published` xanh lá, `Pending` vàng hổ phách, `Draft` ghi xám, `Rejected` đỏ cam), lượt xem, bình luận, ngày cập nhật.
     - *Cột Phải (Dòng hoạt động)*: Tab chuyển đổi linh hoạt giữa **Bình luận mới** (kèm trích dẫn nội dung, trạng thái duyệt) và **Thành viên mới** (kèm avatar con dấu ấn bản và badge phân quyền).
  5. **Huy Hiệu Cảnh Báo Thông Minh Trên Sidebar ([admin/src/components/layout/AdminLayout.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/components/layout/AdminLayout.jsx))**:
     - Hiển thị pill badge đếm số lượng bài viết / bình luận chờ duyệt trực tiếp trên menu Sidebar để Ban Quản trị nhận diện ngay từ mọi trang.
     - Bổ sung nút liên kết nhanh "Xem Public Blog" (`http://localhost:3000`).
  6. **Làm Sạch Codebase**: Đã loại bỏ file nguyên mẫu cũ không còn sử dụng `admin/src/pages/Dashboard.jsx`.

### 7. Chuẩn Hóa Nghiệp Vụ Kiểm Duyệt Bình Luận Khách (Guest Comment Moderation - Hướng A)
- **Vấn đề đã khắc phục**:
  - Trước đây, bình luận của khách không bắt buộc email và câu lệnh CSDL bị hardcode trạng thái `status = 'approved'`, dẫn tới bình luận vừa gửi là hiện ngay trên trang bài viết, trong khi hàng đợi duyệt của Admin hoàn toàn trống rỗng (`0 pending`).
- **Nghiệp vụ Hướng A chuẩn hóa**:
  1. **Public Blog Form ([CommentSection.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/CommentSection.jsx) & [CommentReplyForm.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/CommentReplyForm.jsx))**:
     - Bắt buộc nhập đầy đủ **Họ Tên** và **Email xác thực** hợp lệ (kiểm tra Regex `@` và tên miền).
     - Khi gửi thành công: Hiển thị thông báo màu xanh êm dịu: *"Bình luận của bạn đã được gửi và đang chờ ban biên tập phê duyệt trước khi hiển thị công khai."*
     - Bình luận chưa duyệt không bao giờ lộ ra ngoài giao diện công cộng.
  2. **Backend API ([commentRepository.js](file:///d:/ProjectWeb/BlogWeb/src/repositories/commentRepository.js) & [commentService.js](file:///d:/ProjectWeb/BlogWeb/src/services/commentService.js))**:
     - Cập nhật câu lệnh SQL `create()` lưu mặc định `status = 'pending'` cho độc giả và khách vãng lai.
     - Tự động gán tài khoản độc giả theo email định danh thực tế (thay vì gán bừa cho `guest@blog.local`).
     - Tự động duyệt ngay nếu người gửi là Ban Quản trị (`admin`, `super_admin`, `editor`).
  3. **Admin Moderation & Dashboard Alert**:
     - Ngay khi độc giả gửi bình luận, Dashboard Admin lập tức hiện cảnh báo tại **Action Required Hub** (`⚠️ 1 bình luận mới của độc giả cần kiểm duyệt`).
     - Menu Sidebar Admin hiện badge số lượng chờ duyệt.
     - Ban Quản trị mở **Comments Management** $\to$ Tab **Cần Xử Lý** xem trích dẫn, thông tin người gửi $\to$ Bấm **Duyệt (`approved`)** $\to$ Bình luận lập tức xuất hiện công khai trên Public Blog.

### 8. Nâng Cấp Ngăn Kéo Kiểm Tra Luồng Thảo Luận (Thread Inspector Drawer UX & Bug Fix)
- **Vấn đề đã khắc phục**:
  - Khi quản trị viên bấm *"Xem luồng"* trên một bình luận trong tab **Cần Xử Lý**, hệ thống bị lấy nhầm ID của bình luận (`comment.id`) truyền vào endpoint lấy bài viết (`GET /api/comments/post/:id/admin`), dẫn tới thông báo rỗng *"Chưa có bình luận nào cho bài viết này"*.
  - Ngăn kéo kiểm tra luồng ([ThreadInspectorDrawer.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/components/comments/ThreadInspectorDrawer.jsx)) trước đây chỉ có thể đóng bằng nút X nhỏ, chưa hỗ trợ bấm ra ngoài vùng backdrop để đóng và chưa có phím tắt Escape.
- **Giải pháp triển khai**:
  1. **Sửa Logic Phân Giải Post ID ([CommentsManagement.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/pages/CommentsManagement.jsx))**:
     - Cập nhật `handleOpenThread` phân giải chính xác `resolvedPostId = item.post_id || item.id`. Khi click từ hàng đợi bình luận, `item.post_id` được ưu tiên lấy, giúp endpoint API tải đúng 100% cây thảo luận của bài viết.
     - Truyền thêm `highlightCommentId` xuống ngăn kéo để nhận diện bình luận đích.
  2. **Click Outside & Keyboard Escape ([ThreadInspectorDrawer.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/components/comments/ThreadInspectorDrawer.jsx))**:
     - Gán `onClick={onClose}` trên lớp nền mờ đen (`backdrop`).
     - Thêm `onClick={(e) => e.stopPropagation()}` trên container ngăn kéo bên phải để chặn sự kiện click lan truyền.
     - Bổ sung `useEffect` lắng nghe phím `Escape` để đóng ngăn kéo tiện lợi cho người dùng bàn phím.
  3. **Auto-Scroll & Highlight Bình Luận Đang Soi**:
     - Tự động cuộn mượt (`scrollIntoView({ behavior: 'smooth', block: 'center' })`) tới ngay bình luận được chọn khi mở drawer.
     - Hiệu ứng viền phát sáng Indigo (`ring-2 ring-indigo-500`) và huy hiệu `★ Mục tiêu xem luồng` giúp quản trị viên dễ dàng định vị vị trí bình luận trong toàn bộ cây phân cấp đa tầng.

### 9. Khắc Phục Lỗi Hiển Thị Màu Icon Trình Soạn Thảo (RichTextEditor Toolbar Dark Mode Fix)
- **Vấn đề đã khắc phục**:
  - Các icon thanh công cụ của trình soạn thảo trực quan Quill (`Bold`, `Italic`, `Underline`, `Strike`, `Blockquote`, `Code`, `List`, `Link`, `Image`, `Clean`) trong modal Thêm/Sửa bài viết bị màu xám đen xì than chì (`#444`), gần như vô hình và chìm vào nền Dark Mode.
  - Nguyên nhân do CSS Quill phụ thuộc vào biến CSS `--text-muted` và `--bg-panel` nhưng các biến này chưa từng được định nghĩa trong [index.css](file:///d:/ProjectWeb/BlogWeb/admin/src/assets/styles/index.css), dẫn đến trình duyệt fallback về style gốc `#444` của thư viện Quill.
- **Giải pháp triển khai**:
  1. **Bổ Sung Tokens Trong [index.css](file:///d:/ProjectWeb/BlogWeb/admin/src/assets/styles/index.css)**:
     - Định nghĩa `--text-muted: #64748b` (Light) / `#94a3b8` (Dark).
     - Định nghĩa `--bg-panel`, `--editor-toolbar-bg`, `--editor-content-bg`, `--editor-border` cho cả 2 theme.
  2. **Bộ Quy Tắc Chuyên Sâu Trong [RichTextEditor.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/components/editor/RichTextEditor.jsx)**:
     - Dark Mode: Các nét vẽ SVG và fill (`.ql-stroke`, `.ql-fill`) sử dụng màu Slate sáng bạc `#cbd5e1`, tương phản cao và sắc nét 100%.
     - Light Mode: Nét vẽ màu Slate `#475569`.
     - Hover button: Nền highlight `#1e293b` (Dark) / `#e2e8f0` (Light), icon chuyển sang màu Indigo `#818cf8` / `#6366f1`.
     - Active button (`.ql-active`): Nền Indigo trong suốt kèm viền nhận diện rõ rệt khi đang kích hoạt công cụ định dạng.
     - Dropdown popover (`.ql-picker-options`): Nền xanh than `#0f172a`, viền `#334155`, shadow nổi khối, khắc phục triệt để lỗi menu dropdown bị lem màu.
     - Typography vùng nhập: Hỗ trợ blockquote Indigo, khối code `pre.ql-syntax` có font monospace trên nền tối, placeholder rõ ràng và viền focus đồng bộ.

### 10. Module Liên Hệ Tòa Soạn (Contact Center Inbox)
- **Kiến trúc & CSDL**:
  - Bảng `contacts`: lưu `name`, `email`, `subject_type`, `title`, `message`, `status` (`new`, `in_progress`, `resolved`, `spam`), `admin_notes`, `assigned_to`, `resolved_at`, `created_at`.
  - Indexes: `idx_contacts_status`, `idx_contacts_created_at`, `idx_contacts_email`.
- **Public Blog ([ContactForm.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/ContactForm.jsx))**:
  - Gửi dữ liệu thực tế tới `POST /api/contact` kèm validation email và độ dài tối thiểu 10 ký tự.
  - Phản hồi êm dịu, không reload trang, lưu thông tin vào localStorage.
- **Admin Portal ([ContactsManagement.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/pages/ContactsManagement.jsx))**:
  - Thiết kế Command Inbox: 4 thẻ KPI Vital Signs (`Chưa xử lý`, `Đang xử lý`, `Đã xong`, `Rác`).
  - Hàng đợi tin nhắn mới có nhãn nhấp nháy nổi bật.
  - Bộ lọc Tab theo trạng thái, tìm kiếm từ khóa, phân trang mượt mà.
  - Ngăn kéo chi tiết [ContactDetailDrawer.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/components/contacts/ContactDetailDrawer.jsx) hỗ trợ Click-Outside, phím Escape, ghi chú nội bộ, đổi trạng thái 1-click và nút "Trả Lời Email" qua `mailto:`.
  - Huy hiệu (Badge) đếm thư mới xuất hiện thời gian thực trên menu Sidebar `AdminLayout.jsx`.

### 11. Module Bản Tin & Tự Động Gửi Email Bài Mới (Newsletter Automation)
- **Kiến trúc & CSDL**:
  - Bảng `newsletter_subscribers`: lưu `email`, `status` (`active`, `unsubscribed`), `unsubscribe_token` ngẫu nhiên bảo mật 24 bytes, ngày đăng ký, ngày hủy.
  - Bảng `newsletter_deliveries`: ràng buộc duy nhất `UNIQUE (post_id, subscriber_id)` **bảo đảm 100% không bao giờ gửi trùng lặp bài viết cho cùng một độc giả**.
- **Public Blog ([NewsletterBox.jsx](file:///d:/ProjectWeb/BlogWeb/blog/src/components/blog/NewsletterBox.jsx) & [unsubscribe/page.js](file:///d:/ProjectWeb/BlogWeb/blog/src/app/newsletter/unsubscribe/page.js))**:
  - Kết nối `POST /api/newsletter/subscribe`: hiển thị trạng thái loading spinner, thông báo đã đăng ký, hoặc chào mừng quay trở lại nếu email từng hủy nhận tin.
  - Trang xác nhận hủy đăng ký [unsubscribe/page.js](file:///d:/ProjectWeb/BlogWeb/blog/src/app/newsletter/unsubscribe/page.js) xác thực qua token mà không cần đăng nhập.
- **Tự Động Kích Hoạt Gửi Email Khi Post PUBLISHED ([postService.js](file:///d:/ProjectWeb/BlogWeb/src/services/postService.js))**:
  - Khi bài viết được xuất bản (`approvePost` hoặc `createPost`/`updatePost` chuyển sang `published`), hệ thống tự động kích hoạt `newsletterService.triggerPostPublished(post)`.
  - Tác vụ chạy ngầm bất đồng bộ (Non-blocking background job), gửi theo từng lô 25 email với khoảng nghỉ để chống nghẽn và tôn trọng rate limit.
  - Template email HTML responsive chuẩn Editorial sang trọng kèm nút đọc bài viết và link hủy đăng ký 1-click.
  - Safe fallback: Nếu chưa cấu hình SMTP, hệ thống tự động chạy ở chế độ dev simulation và ghi log, không làm gián đoạn hay rollback việc duyệt bài.
- **Admin Portal ([NewsletterManagement.jsx](file:///d:/ProjectWeb/BlogWeb/admin/src/pages/NewsletterManagement.jsx))**:
  - Tab 1: Quản lý danh sách người đăng ký (tìm kiếm email, xem trạng thái, hủy đăng ký thủ công, xóa theo GDPR).
  - Tab 2: Lịch sử phát hành bài viết (thống kê số lượng email gửi thành công, số lượng lỗi cho từng bài viết).

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG TOÀN DIỆN

### 1. Khởi động Backend (Express API - Port 5000)
```bash
# Tại thư mục gốc: BlogWeb
npm run dev
# Server chạy tại: http://localhost:5000
```

### 2. Khởi động Admin Portal (React Vite - Port 5173)
```bash
# Tại thư mục: BlogWeb/admin
npm run dev
# Admin Portal chạy tại: http://localhost:5173
```

### 3. Khởi động Public Blog (Next.js - Port 3000)
```bash
# Tại thư mục: BlogWeb/blog
npm run dev
# Public Blog chạy tại: http://localhost:3000
```

---

## 📝 QUY TẮC BẢO TRÌ & MỞ RỘNG
> **Nguyên tắc cốt lõi**: Bất kỳ sự thay đổi hoặc bổ sung tính năng nào trong tương lai (tạo thêm route, cập nhật schema database, bổ sung phân quyền) đều phải được cập nhật ngay lập tức vào file `PROJECT_MAP.md` này. Mọi AI assistant hoặc lập trình viên mới tiếp cận dự án chỉ cần đọc file này là nắm bắt được toàn bộ cấu trúc và tiến độ.
