const bcrypt = require('bcryptjs');
const db = require('./db');

async function runSeed() {
  const client = await db.pool.connect();

  try {
    console.log('🚀 Bắt đầu tiến trình SEED DATA cho hệ thống BlogWeb...');
    await client.query('BEGIN');

    // =========================================================================
    // 1. TẠO TÀI KHOẢN NGƯỜI DÙNG (USERS)
    // =========================================================================
    console.log('👤 Đang tạo tài khoản người dùng mẫu...');
    const defaultPassword = 'Password123@';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    const usersData = [
      {
        username: 'admin_baon',
        email: 'admin@blog.local',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'editor_hoang',
        email: 'editor1@blog.local',
        role: 'editor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'editor_thuydung',
        email: 'editor2@blog.local',
        role: 'editor',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'author_minhduc',
        email: 'author1@blog.local',
        role: 'author',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'author_thanhnga',
        email: 'author2@blog.local',
        role: 'author',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'quanghuy_dev',
        email: 'reader1@blog.local',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'nguyenmai_tech',
        email: 'reader2@blog.local',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'tuananh_frontend',
        email: 'reader3@blog.local',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'thuha_cloud',
        email: 'reader4@blog.local',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'vietdung_backend',
        email: 'reader5@blog.local',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      },
      {
        username: 'huonggiang_ui',
        email: 'reader6@blog.local',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
    ];

    const userMap = new Map(); // username -> id

    for (const u of usersData) {
      const res = await client.query(
        `
        INSERT INTO users (username, email, password_hash, role, avatar)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE 
        SET username = EXCLUDED.username,
            role = EXCLUDED.role,
            avatar = EXCLUDED.avatar
        RETURNING id, username, email;
      `,
        [u.username, u.email, passwordHash, u.role, u.avatar]
      );
      userMap.set(u.username, res.rows[0].id);
    }

    // Lấy thêm user hiện có (nếu có)
    const existingUsers = await client.query('SELECT id, username FROM users');
    existingUsers.rows.forEach((r) => userMap.set(r.username, r.id));

    console.log(`✅ Đã đồng bộ ${userMap.size} người dùng.`);

    // =========================================================================
    // 2. TẠO DANH MỤC BÀI VIẾT (CATEGORIES)
    // =========================================================================
    console.log('📂 Đang tạo danh mục bài viết...');
    const categoriesData = [
      {
        name: 'JavaScript & TypeScript',
        slug: 'javascript-typescript',
        description: 'Ngôn ngữ cốt lõi, cú pháp hiện đại, lập trình bất đồng bộ và kỹ thuật nâng cao.',
      },
      {
        name: 'React & Frontend',
        slug: 'react-frontend',
        description: 'Hệ sinh thái React, Hooks, Virtual DOM, tối ưu hóa Re-render và State Management.',
      },
      {
        name: 'Next.js & Fullstack',
        slug: 'nextjs-fullstack',
        description: 'App Router, Server Components, SSR, ISR, Turbopack và SEO cho ứng dụng hiện đại.',
      },
      {
        name: 'Node.js & Backend Architecture',
        slug: 'nodejs-backend',
        description: 'Xây dựng REST API, Clean Architecture, Authentication JWT và bảo mật hệ thống.',
      },
      {
        name: 'Cơ sở dữ liệu & PostgreSQL',
        slug: 'database-postgresql',
        description: 'Thiết kế Schema, Indexing, Transaction, Connection Pool và tối ưu câu truy vấn.',
      },
      {
        name: 'DevOps & Cloud Deployment',
        slug: 'devops-cloud',
        description: 'Docker, Containerization, CI/CD pipeline, Nginx reverse proxy và giám sát hệ thống.',
      },
      {
        name: 'Tối ưu hiệu năng Web',
        slug: 'web-performance',
        description: 'Core Web Vitals, giảm tải bundle, tối ưu hóa tải ảnh và bộ nhớ đệm Caching.',
      },
      {
        name: 'Thiết kế UI/UX & Design Systems',
        slug: 'ui-ux-design',
        description: 'Design Tokens, giao diện tương thích, Micro-interactions và Accessibility (A11y).',
      },
    ];

    const categoryMap = new Map(); // slug -> id

    for (const c of categoriesData) {
      const res = await client.query(
        `
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO UPDATE 
        SET name = EXCLUDED.name,
            description = EXCLUDED.description
        RETURNING id, slug;
      `,
        [c.name, c.slug, c.description]
      );
      categoryMap.set(c.slug, res.rows[0].id);
    }
    console.log(`✅ Đã đồng bộ ${categoryMap.size} danh mục.`);

    // =========================================================================
    // 3. TẠO BÀI VIẾT (POSTS)
    // =========================================================================
    console.log('📝 Đang tạo 20 bài viết công nghệ với nội dung giàu định dạng...');

    const postsData = [
      {
        title: 'Hiểu tường tận Event Loop trong JavaScript từ microtask đến macrotask',
        slug: 'hieu-tuong-tan-event-loop-trong-javascript-tu-microtask-den-macrotask',
        summary: 'Khám phá chi tiết cách JavaScript Engine xử lý Call Stack, Web APIs, Microtask Queue và Macrotask Queue trong môi trường đơn luồng.',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'javascript-typescript',
        author_username: 'author_minhduc',
        status: 'published',
        is_published: true,
        views_count: 5420,
        likes_count: 145,
        shares_count: 38,
        days_ago: 45,
        content: `
<h2>1. Đặt vấn đề: JavaScript đơn luồng vận hành như thế nào?</h2>
<p>JavaScript là một ngôn ngữ đơn luồng (single-threaded), nghĩa là tại một thời điểm chỉ có thể thực thi một tác vụ duy nhất trên <strong>Call Stack</strong>. Tuy nhiên, các ứng dụng web hiện đại vẫn có thể gọi API mạng, đọc file và xử lý các sự kiện click mượt mà mà không làm đơ giao diện. Phép màu đó đến từ <em>Event Loop</em>.</p>

<blockquote>
  "Event Loop không phải là một phần của JavaScript Engine (như V8), mà là một cơ chế của runtime environment (trình duyệt hoặc Node.js) để phối hợp công việc giữa Call Stack và các hàng đợi."
</blockquote>

<h2>2. Cấu trúc tổng thể của Event Loop</h2>
<p>Hệ sinh thái xử lý bất đồng bộ trong JavaScript gồm 4 thành phần chính:</p>
<ul>
  <li><strong>Call Stack:</strong> Nơi lưu trữ ngữ cảnh thực thi (Execution Context) theo cơ chế LIFO.</li>
  <li><strong>Web APIs / Libuv:</strong> Môi trường thực thi các tác vụ chạy nền như setTimeout, DOM events, fetch.</li>
  <li><strong>Microtask Queue:</strong> Hàng đợi ưu tiên cao nhất, chứa Promise callbacks, <code>queueMicrotask</code>, MutationObserver.</li>
  <li><strong>Macrotask Queue (Callback Queue):</strong> Hàng đợi chứa <code>setTimeout</code>, <code>setInterval</code>, <code>setImmediate</code>.</li>
</ul>

<h2>3. Ví dụ minh họa thứ tự thực thi</h2>
<p>Hãy xem xét đoạn code kinh điển dưới đây:</p>
<pre><code>console.log('1. Bắt đầu');

setTimeout(() => {
  console.log('2. Timeout callback (Macrotask)');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Promise callback (Microtask)');
});

queueMicrotask(() => {
  console.log('4. QueueMicrotask callback');
});

console.log('5. Kết thúc');
</code></pre>

<h3>Kết quả in ra màn hình:</h3>
<ol>
  <li><code>1. Bắt đầu</code> (Đồng bộ trên Call Stack)</li>
  <li><code>5. Kết thúc</code> (Đồng bộ trên Call Stack)</li>
  <li><code>3. Promise callback (Microtask)</code> (Microtask queue được rút cạn trước)</li>
  <li><code>4. QueueMicrotask callback</code> (Vẫn là Microtask)</li>
  <li><code>2. Timeout callback (Macrotask)</code> (Event Loop lấy macrotask đầu tiên)</li>
</ol>

<h2>4. Kết luận & Lời khuyên tối ưu</h2>
<p>Việc hiểu rõ Event Loop giúp bạn tránh được tình trạng <em>blocking the main thread</em>, lựa chọn đúng giữa <code>requestAnimationFrame</code>, <code>Promise</code> và <code>setTimeout</code> để mang lại trải nghiệm 60fps mượt mà cho người dùng.</p>
        `,
      },
      {
        title: 'React Server Components (RSC) vs SSR: Điểm khác biệt cốt lõi bạn cần nắm',
        slug: 'react-server-components-vs-ssr-diem-khac-biet-cot-loi',
        summary: 'Phân tích bản chất kỹ thuật giữa Server-Side Rendering truyền thống và React Server Components trong Next.js App Router.',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'react-frontend',
        author_username: 'author_thanhnga',
        status: 'published',
        is_published: true,
        views_count: 3890,
        likes_count: 98,
        shares_count: 24,
        days_ago: 38,
        content: `
<h2>1. Sự nhầm lẫn phổ biến giữa SSR và RSC</h2>
<p>Rất nhiều kỹ sư mới tiếp cận Next.js 13+ lầm tưởng rằng React Server Components (RSC) chỉ là một tên gọi khác của Server-Side Rendering (SSR). Thực tế, đây là hai khái niệm độc lập và bổ trợ lẫn nhau:</p>
<ul>
  <li><strong>SSR:</strong> Chạy code component trên server để tạo ra chuỗi HTML thô và gửi về browser. Sau đó, toàn bộ JavaScript bundle vẫn phải tải về máy khách để thực hiện quá trình <em>Hydration</em>.</li>
  <li><strong>RSC:</strong> Component CHỈ chạy trên server. Mã nguồn của component đó hoàn toàn KHÔNG bao giờ được đóng gói vào client JavaScript bundle.</li>
</ul>

<h2>2. Bảng so sánh chi tiết</h2>
<p>Dưới đây là bảng tổng hợp các khía cạnh kỹ thuật quan trọng:</p>
<ul>
  <li><strong>Bundle Size:</strong> SSR gửi 100% JS về client; RSC giảm tải kích thước JS bundle về 0KB cho server component.</li>
  <li><strong>Truy cập Backend:</strong> RSC có thể truy vấn trực tiếp CSDL qua Prisma/pg mà không cần REST API phụ trợ.</li>
  <li><strong>Hydration:</strong> SSR cần hydrate toàn bộ cây DOM; RSC không cần hydrate các node tĩnh.</li>
</ul>

<h2>3. Quy tắc "Client Boundary" (use client)</h2>
<p>Hãy chỉ đặt <code>'use client'</code> tại lá của cây component nơi thực sự cần tương tác như <code>useState</code>, <code>useEffect</code> hoặc lắng nghe event click.</p>
        `,
      },
      {
        title: 'Tối ưu hóa truy vấn PostgreSQL với EXPLAIN ANALYZE và Composite Index',
        slug: 'toi-uu-hoa-truy-van-postgresql-voi-explain-analyze-va-composite-index',
        summary: 'Hướng dẫn đọc hiểu Query Execution Plan, phát hiện Seq Scan và thiết lập B-Tree Composite Index giúp câu lệnh tăng tốc 50 lần.',
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'database-postgresql',
        author_username: 'editor_hoang',
        status: 'published',
        is_published: true,
        views_count: 2940,
        likes_count: 76,
        shares_count: 19,
        days_ago: 30,
        content: `
<h2>1. Tại sao cơ sở dữ liệu của bạn chạy chậm?</h2>
<p>Khi bảng dữ liệu tăng từ 1,000 dòng lên 1,000,000 dòng, một câu truy vấn SELECT đơn giản không có Index có thể biến từ vài mili-giây thành vài giây do <strong>Sequential Scan (Seq Scan)</strong> quét toàn bộ ổ đĩa.</p>

<h2>2. Sử dụng EXPLAIN ANALYZE</h2>
<p>Lệnh <code>EXPLAIN ANALYZE</code> cho biết chính xác cách PostgreSQL lập kế hoạch và thực thi câu lệnh SQL:</p>
<pre><code>EXPLAIN ANALYZE 
SELECT id, title, created_at 
FROM posts 
WHERE category_id = 5 AND status = 'published'
ORDER BY created_at DESC 
LIMIT 10;
</code></pre>

<h2>3. Thiết lập Composite Index chuẩn xác</h2>
<p>Để tối ưu câu lệnh trên gồm cả bộ lọc WHERE và mệnh đề ORDER BY, một Composite Index đa cột theo thứ tự hợp lý là giải pháp hoàn hảo:</p>
<pre><code>CREATE INDEX idx_posts_category_status_created 
ON posts (category_id, status, created_at DESC);
</code></pre>
<p>Sau khi có Index, PostgreSQL sẽ chuyển từ <em>Seq Scan</em> sang <strong>Index Scan</strong>, chi phí CPU giảm hơn 95%.</p>
        `,
      },
      {
        title: 'Xây dựng Clean Architecture chuẩn mực với Node.js và Express',
        slug: 'xay-dung-clean-architecture-chuan-muc-voi-nodejs-va-express',
        summary: 'Tách biệt rõ ràng giữa Controller, Service, Repository và Config để dự án dễ bảo trì, dễ viết unit test và không bị ràng buộc công nghệ.',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'nodejs-backend',
        author_username: 'author_minhduc',
        status: 'published',
        is_published: true,
        views_count: 2450,
        likes_count: 62,
        shares_count: 15,
        days_ago: 25,
        content: `
<h2>1. Vấn đề "Fat Controller" trong Express</h2>
<p>Nhiều dự án Express đặt toàn bộ logic xác thực, câu lệnh SQL trực tiếp và response HTTP vào chung một hàm route handler. Khi hệ thống mở rộng, việc bảo trì trở thành một cơn ác mộng.</p>

<h2>2. Mô hình phân tầng Layered Clean Architecture</h2>
<ul>
  <li><strong>Controllers:</strong> Nhận HTTP request, trích xuất params/body, gọi service và trả về JSON chuẩn REST.</li>
  <li><strong>Services:</strong> Chứa logic nghiệp vụ cốt lõi (Business Rules), tính toán, phân quyền và điều phối.</li>
  <li><strong>Repositories:</strong> Tầng duy nhất được phép giao tiếp với CSDL PostgreSQL bằng câu lệnh Parameterized SQL.</li>
</ul>

<h2>3. Kết quả đạt được</h2>
<p>Bằng cách tách biệt này, bạn có thể thay đổi database từ PostgreSQL sang MySQL hoặc MongoDB mà không cần sửa bất kỳ dòng code nào trong tầng Service hay Controller.</p>
        `,
      },
      {
        title: 'Chiến lược Caching nâng cao trong Next.js App Router',
        slug: 'chien-luoc-caching-nang-cao-trong-nextjs-app-router',
        summary: 'Làm chủ 4 cấp độ Cache của Next.js: Request Memoization, Data Cache, Full Route Cache và Router Cache trên máy khách.',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'nextjs-fullstack',
        author_username: 'editor_thuydung',
        status: 'published',
        is_published: true,
        views_count: 2120,
        likes_count: 54,
        shares_count: 12,
        days_ago: 20,
        content: `
<h2>1. Hệ thống Caching 4 tầng của Next.js</h2>
<p>Next.js 14 và 15 cung cấp cơ chế lưu trữ đệm cực kỳ mạnh mẽ nhằm đạt tốc độ tải trang gần như tức thì. Hãy cùng mổ xẻ 4 cơ chế này:</p>
<ol>
  <li><strong>Request Memoization:</strong> Tự động loại bỏ các lệnh gọi <code>fetch</code> trùng lặp trong cùng một chu kỳ render server.</li>
  <li><strong>Data Cache:</strong> Lưu kết quả fetch trên server xuyên suốt nhiều request độc lập cho đến khi revalidate.</li>
  <li><strong>Full Route Cache:</strong> Lưu toàn bộ HTML và RSC Payload tĩnh ở build time hoặc ISR.</li>
  <li><strong>Router Cache:</strong> Lưu RSC Payload tạm thời trong bộ nhớ của trình duyệt người dùng khi chuyển hướng trang.</li>
</ol>
        `,
      },
      {
        title: 'Thiết kế hệ thống phân quyền đa cấp (RBAC) với JWT và Refresh Token',
        slug: 'thiet-ke-he-thong-phan-quyen-da-cap-rbac-voi-jwt-va-refresh-token',
        summary: 'Kiến trúc bảo mật xác thực danh tính phân cấp 4 vai trò Super Admin, Editor, Author và User sử dụng HTTP-only cookie.',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'nodejs-backend',
        author_username: 'admin_baon',
        status: 'published',
        is_published: true,
        views_count: 1980,
        likes_count: 49,
        shares_count: 11,
        days_ago: 18,
        content: `
<h2>1. Nguyên tắc cốt lõi của Role-Based Access Control</h2>
<p>Một hệ thống quản trị nội dung CMS chuyên nghiệp cần phân định ranh giới rõ ràng giữa người sáng tạo nội dung (Author), người kiểm duyệt (Editor) và người quản trị hệ thống (Super Admin).</p>

<h2>2. Cơ chế Access Token ngắn hạn và Refresh Token dài hạn</h2>
<p>Để đảm bảo an toàn, Access Token chỉ nên có hạn sử dụng từ 15-30 phút. Refresh Token được lưu trữ an toàn trong <code>HttpOnly, Secure Cookie</code> để ngăn ngừa triệt để nguy cơ đánh cắp token qua lỗ hổng XSS.</p>
        `,
      },
      {
        title: 'Tối ưu Core Web Vitals: Cách đưa điểm Lighthouse đạt 100 tuyệt đối',
        slug: 'toi-uu-core-web-vitals-cach-dua-diem-lighthouse-dat-100-tuyet-doi',
        summary: 'Bí quyết cải thiện LCP dưới 1.2s, CLS bằng 0 và INP phản hồi ngay lập tức trên các trang web tin tức và blog công nghệ.',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'web-performance',
        author_username: 'editor_hoang',
        status: 'published',
        is_published: true,
        views_count: 1750,
        likes_count: 42,
        shares_count: 8,
        days_ago: 15,
        content: `
<h2>1. Ba chỉ số Core Web Vitals bạn bắt buộc phải tối ưu</h2>
<ul>
  <li><strong>Largest Contentful Paint (LCP):</strong> Thời gian render nội dung khối lớn nhất (ảnh banner hoặc tiêu đề H1). Mục tiêu: &lt; 2.5s (lý tưởng &lt; 1.2s).</li>
  <li><strong>Interaction to Next Paint (INP):</strong> Độ trễ phản hồi khi người dùng bấm vào các nút tương tác. Mục tiêu: &lt; 200ms.</li>
  <li><strong>Cumulative Layout Shift (CLS):</strong> Mức độ giật cục giao diện khi tài nguyên tải về. Mục tiêu: &lt; 0.1 (lý tưởng = 0).</li>
</ul>
        `,
      },
      {
        title: 'Tại sao bạn nên chọn PostgreSQL thay vì MongoDB cho ứng dụng thương mại?',
        slug: 'tai-sao-nen-chon-postgresql-thay-vi-mongodb-cho-ung-dung-thuong-mai',
        summary: 'So sánh chuyên sâu về tính toàn vẹn dữ liệu ACID, khả năng xử lý JSONB linh hoạt và chi phí vận hành lâu dài giữa hai hệ CSDL phổ biến.',
        thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'database-postgresql',
        author_username: 'author_thanhnga',
        status: 'published',
        is_published: true,
        views_count: 1640,
        likes_count: 38,
        shares_count: 7,
        days_ago: 12,
        content: `
<h2>1. Huyền thoại "NoSQL nhanh hơn SQL"</h2>
<p>Nhiều năm trước, MongoDB nổi lên như một giải pháp thay thế linh hoạt cho quan hệ bảng cứng nhắc. Tuy nhiên, với sự phát triển vượt bậc của kiểu dữ liệu <strong>JSONB</strong> và chỉ mục GIN trên PostgreSQL, ranh giới này đã hoàn toàn thay đổi.</p>
        `,
      },
      {
        title: 'Hướng dẫn triển khai Docker Compose cho môi trường Production',
        slug: 'huong-dan-trien-khai-docker-compose-cho-moi-truong-production',
        summary: 'Đóng gói ứng dụng Fullstack gồm Node.js API, PostgreSQL Database và Nginx Reverse Proxy với SSL Let\'s Encrypt tự động gia hạn.',
        thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'devops-cloud',
        author_username: 'editor_thuydung',
        status: 'published',
        is_published: true,
        views_count: 1420,
        likes_count: 35,
        shares_count: 6,
        days_ago: 10,
        content: `
<h2>1. Docker Compose không chỉ dành cho Development</h2>
<p>Với các ứng dụng vừa và nhỏ, Docker Compose là sự lựa chọn tối ưu về chi phí và tính đơn giản trước khi bạn phải đối mặt với sự phức tạp của Kubernetes.</p>
        `,
      },
      {
        title: 'Design Tokens: Chìa khóa đồng bộ giao diện giữa Figma và Code',
        slug: 'design-tokens-chia-khoa-dong-bo-giao-dien-giua-figma-va-code',
        summary: 'Cách tổ chức biến CSS Variables, màu sắc HSL Tailored và bán kính viền border radius giúp việc triển khai Dark Mode trở nên hoàn hảo.',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'ui-ux-design',
        author_username: 'author_thanhnga',
        status: 'published',
        is_published: true,
        views_count: 1280,
        likes_count: 31,
        shares_count: 5,
        days_ago: 8,
        content: `
<h2>1. Design Tokens là gì?</h2>
<p>Design Tokens là những đơn vị thiết kế nguyên tử đại diện cho màu sắc, khoảng cách, font chữ, độ mờ và bán kính bo góc. Khi đổi một token màu tại tầng gốc, toàn bộ ứng dụng sẽ tự động thích ứng đồng bộ.</p>
        `,
      },
      {
        title: 'Quản lý State phức tạp với Zustand: Đơn giản và thanh thoát hơn Redux',
        slug: 'quan-ly-state-phuc-tap-voi-zustand-don-gian-va-thanh-thoat-hon-redux',
        summary: 'Tại sao cộng đồng React đang dần chuyển dịch từ Redux Toolkit sang Zustand cho các dự án web quy mô vừa và lớn.',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'react-frontend',
        author_username: 'author_minhduc',
        status: 'published',
        is_published: true,
        views_count: 1150,
        likes_count: 28,
        shares_count: 4,
        days_ago: 6,
        content: `
<h2>1. Sự cồng kềnh của Boilerplate</h2>
<p>Zustand giải quyết bài toán State Management bằng cách loại bỏ hoàn toàn Context Provider bọc quanh app, hỗ trợ selective re-render và tích hợp devtools chỉ với vài dòng code.</p>
        `,
      },
      {
        title: 'Những cạm bẫy thường gặp khi xử lý Transaction trong cơ sở dữ liệu',
        slug: 'nhung-cam-bay-thuong-gap-khi-xu-ly-transaction-trong-co-so-du-lieu',
        summary: 'Tìm hiểu về Deadlock, các cấp độ Isolation Level (Read Committed, Repeatable Read, Serializable) và cách phòng tránh thất thoát dữ liệu.',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'database-postgresql',
        author_username: 'editor_hoang',
        status: 'published',
        is_published: true,
        views_count: 980,
        likes_count: 24,
        shares_count: 3,
        days_ago: 5,
        content: `
<h2>1. Tính chất ACID và bài toán thực tế</h2>
<p>Không phải cứ gọi BEGIN và COMMIT là dữ liệu của bạn an toàn. Hiểu đúng về Dirty Read, Non-repeatable Read và Phantom Read là yêu cầu bắt buộc đối với một backend engineer dày dạn kinh nghiệm.</p>
        `,
      },
      {
        title: 'Micro-animations: Nâng tầm trải nghiệm người dùng với chuyển động vi mô',
        slug: 'micro-animations-nang-tam-trai-nghiem-nguoi-dung-voi-chuyen-dong-vi-mo',
        summary: 'Nghệ thuật sử dụng chuyển động nhẹ nhàng khi hover, click và focus để tạo cảm xúc cao cấp cho sản phẩm web.',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'ui-ux-design',
        author_username: 'author_thanhnga',
        status: 'published',
        is_published: true,
        views_count: 750,
        likes_count: 19,
        shares_count: 2,
        days_ago: 3,
        content: `
<h2>1. Sức mạnh của chuyển động tinh tế</h2>
<p>Một nút bấm có hiệu ứng chuyển màu mượt mà 150ms sẽ tạo cảm giác phản hồi cao cấp hơn hẳn một giao diện cứng nhắc. Tuy nhiên, lạm dụng hiệu ứng nhảy co giật sẽ gây phản tác dụng.</p>
        `,
      },
      {
        title: 'Bảo mật API RESTful: Phòng chống triệt để các lỗ hổng OWASP Top 10',
        slug: 'bao-mat-api-restful-phong-chong-triet-de-cac-lo-hong-owasp-top-10',
        summary: 'Các biện pháp phòng thủ trước SQL Injection, Broken Object Level Authorization (BOLA), Rate Limiting và CORS Misconfiguration.',
        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'nodejs-backend',
        author_username: 'admin_baon',
        status: 'published',
        is_published: true,
        views_count: 620,
        likes_count: 16,
        shares_count: 2,
        days_ago: 2,
        content: `
<h2>1. BOLA - Lỗ hổng số một của API</h2>
<p>Broken Object Level Authorization xảy ra khi endpoint cho phép người dùng sửa đổi tài nguyên của người khác chỉ bằng cách thay đổi ID trên thanh URL mà không kiểm tra quyền sở hữu.</p>
        `,
      },

      // --- 3 BÀI VIẾT CHỜ DUYỆT (PENDING) ---
      {
        title: 'Microservices với Docker và Kubernetes cho người mới bắt đầu',
        slug: 'microservices-voi-docker-va-kubernetes-cho-nguoi-moi-bat-dau',
        summary: 'Hướng dẫn từng bước chia nhỏ Monolith sang Microservices và điều phối container bằng K8s.',
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'devops-cloud',
        author_username: 'author_minhduc',
        status: 'pending',
        is_published: false,
        views_count: 0,
        likes_count: 0,
        shares_count: 0,
        days_ago: 1,
        content: `<h2>Bài viết đang chờ ban biên tập phê duyệt nội dung.</h2><p>Nội dung chi tiết về Pods, Services, Ingress Controller và chiến lược triển khai Canary Deployment.</p>`,
      },
      {
        title: 'Tối ưu hóa bundle kích thước JavaScript với Tree Shaking',
        slug: 'toi-uu-hoa-bundle-kich-thuoc-javascript-voi-tree-shaking',
        summary: 'Loại bỏ code thừa không sử dụng trong quá trình build với ES Modules và Webpack / Turbopack.',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'web-performance',
        author_username: 'author_thanhnga',
        status: 'pending',
        is_published: false,
        views_count: 0,
        likes_count: 0,
        shares_count: 0,
        days_ago: 1,
        content: `<h2>Phân tích Tree Shaking trong các thư viện lớn như lodash và date-fns.</h2>`,
      },
      {
        title: 'Kỹ thuật xây dựng Realtime App với WebSocket và Redis Pub/Sub',
        slug: 'ky-thuat-xay-dung-realtime-app-voi-websocket-va-redis-pub-sub',
        summary: 'Mở rộng hệ thống thông báo tức thời xuyên suốt nhiều node server backend bằng kênh phát thanh Redis.',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'nodejs-backend',
        author_username: 'author_minhduc',
        status: 'pending',
        is_published: false,
        views_count: 0,
        likes_count: 0,
        shares_count: 0,
        days_ago: 0,
        content: `<h2>Xử lý kết nối Socket.io phân tán với Redis Adapter.</h2>`,
      },

      // --- 2 BÀI VIẾT BẢN NHÁP (DRAFT) ---
      {
        title: 'Tổng quan về CSS Container Queries trong thiết kế hiện đại',
        slug: 'tong-quan-ve-css-container-queries-trong-thiet-ke-hien-dai',
        summary: 'Thay thế Media Queries truyền thống bằng Container Queries để component tự responsive theo không gian cha.',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'ui-ux-design',
        author_username: 'author_thanhnga',
        status: 'draft',
        is_published: false,
        views_count: 0,
        likes_count: 0,
        shares_count: 0,
        days_ago: 0,
        content: `<h2>Bản nháp đang trong quá trình phác thảo ý tưởng.</h2>`,
      },
      {
        title: 'Kiểm thử tự động với Vitest và React Testing Library',
        slug: 'kiem-thu-tu-dong-voi-vitest-va-react-testing-library',
        summary: 'Viết unit test và integration test nhanh gấp 5 lần so với Jest cho dự án React Vite.',
        thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'react-frontend',
        author_username: 'author_minhduc',
        status: 'draft',
        is_published: false,
        views_count: 0,
        likes_count: 0,
        shares_count: 0,
        days_ago: 0,
        content: `<h2>Bản nháp chưa nộp duyệt của tác giả Minh Đức.</h2>`,
      },

      // --- 1 BÀI VIẾT BỊ TỪ CHỐI (REJECTED) ---
      {
        title: 'Phân tích so sánh GraphQL và gRPC cho ứng dụng di động',
        slug: 'phan-tich-so-sanh-graphql-va-grpc-cho-ung-dung-di-dong',
        summary: 'So sánh giữa giao thức truyền tải văn bản JSON và Binary Protocol trên nền HTTP/2.',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
        category_slug: 'nodejs-backend',
        author_username: 'author_thanhnga',
        status: 'rejected',
        is_published: false,
        rejection_reason: 'Nội dung bài viết cần bổ sung thêm benchmark đo đạc độ trễ mạng thực tế và phân tích cụ thể các trường hợp nên dùng Protocol Buffers trước khi xuất bản.',
        views_count: 0,
        likes_count: 0,
        shares_count: 0,
        days_ago: 2,
        content: `<h2>Bài viết bị từ chối bởi biên tập viên Hoàng do chưa đạt độ sâu kỹ thuật.</h2>`,
      },
    ];

    const postMap = new Map(); // slug -> id

    for (const p of postsData) {
      const authorId = userMap.get(p.author_username) || userMap.get('admin_baon');
      const categoryId = categoryMap.get(p.category_slug) || null;

      const createdAt = new Date(Date.now() - p.days_ago * 24 * 60 * 60 * 1000);
      const publishedAt = p.status === 'published' ? createdAt : null;
      const submittedAt = p.status === 'pending' || p.status === 'rejected' ? createdAt : null;

      const res = await client.query(
        `
        INSERT INTO posts (
          title, slug, summary, content, thumbnail, category_id, author_id,
          is_published, status, rejection_reason, submitted_at, published_at,
          views_count, likes_count, shares_count, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16)
        ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            content = EXCLUDED.content,
            thumbnail = EXCLUDED.thumbnail,
            category_id = EXCLUDED.category_id,
            author_id = EXCLUDED.author_id,
            is_published = EXCLUDED.is_published,
            status = EXCLUDED.status,
            rejection_reason = EXCLUDED.rejection_reason,
            submitted_at = EXCLUDED.submitted_at,
            published_at = EXCLUDED.published_at,
            views_count = EXCLUDED.views_count,
            likes_count = EXCLUDED.likes_count,
            shares_count = EXCLUDED.shares_count
        RETURNING id, slug;
      `,
        [
          p.title,
          p.slug,
          p.summary,
          p.content,
          p.thumbnail,
          categoryId,
          authorId,
          p.is_published,
          p.status,
          p.rejection_reason || null,
          submittedAt,
          publishedAt,
          p.views_count,
          p.likes_count,
          p.shares_count,
          createdAt,
        ]
      );

      postMap.set(p.slug, res.rows[0].id);
    }
    console.log(`✅ Đã đồng bộ ${postMap.size} bài viết.`);

    // =========================================================================
    // 4. TẠO READ DEPTH ANALYTICS (POST_READ_DEPTH)
    // =========================================================================
    console.log('📊 Đang đồng bộ chỉ số Scroll / Read Depth cho các bài viết đã xuất bản...');
    for (const p of postsData) {
      if (p.status !== 'published') continue;
      const postId = postMap.get(p.slug);
      if (!postId) continue;

      const totalSessions = Math.max(Math.floor(p.views_count * 0.8), 20);
      const reached25 = Math.floor(totalSessions * 0.85);
      const reached50 = Math.floor(totalSessions * 0.62);
      const reached75 = Math.floor(totalSessions * 0.42);
      const reached100 = Math.floor(totalSessions * 0.28); // Completion rate ~28%

      await client.query(
        `
        INSERT INTO post_read_depth (post_id, total_sessions, reached_25, reached_50, reached_75, reached_100, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (post_id) DO UPDATE
        SET total_sessions = EXCLUDED.total_sessions,
            reached_25 = EXCLUDED.reached_25,
            reached_50 = EXCLUDED.reached_50,
            reached_75 = EXCLUDED.reached_75,
            reached_100 = EXCLUDED.reached_100,
            updated_at = CURRENT_TIMESTAMP;
      `,
        [postId, totalSessions, reached25, reached50, reached75, reached100]
      );
    }
    console.log('✅ Đã tạo chỉ số Read Depth phân tích phễu đọc.');

    // =========================================================================
    // 5. TẠO LƯỢT THÍCH BÀI VIẾT (POST_LIKES)
    // =========================================================================
    console.log('❤️ Đang đồng bộ dữ liệu người dùng yêu thích bài viết...');
    const sampleUsersForLikes = [
      userMap.get('quanghuy_dev'),
      userMap.get('nguyenmai_tech'),
      userMap.get('tuananh_frontend'),
      userMap.get('thuha_cloud'),
      userMap.get('vietdung_backend'),
      userMap.get('huonggiang_ui'),
      userMap.get('author_minhduc'),
      userMap.get('author_thanhnga'),
    ].filter(Boolean);

    for (const p of postsData) {
      if (p.status !== 'published') continue;
      const postId = postMap.get(p.slug);
      if (!postId) continue;

      // Chọn ngẫu nhiên 3-6 user like bài viết
      const likers = sampleUsersForLikes.slice(0, Math.min(sampleUsersForLikes.length, Math.max(2, (postId % 6) + 2)));
      for (const userId of likers) {
        await client.query(
          `
          INSERT INTO post_likes (post_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT (post_id, user_id) DO NOTHING;
        `,
          [postId, userId]
        );
      }
    }
    console.log('✅ Đã tạo bảng liên kết post_likes.');

    // =========================================================================
    // 6. TẠO BÌNH LUẬN & CÂY THẢO LUẬN PHÂN CẤP (COMMENTS)
    // =========================================================================
    console.log('💬 Đang tạo cây bình luận lồng nhau đa tầng...');

    // Dọn dẹp comment của các bài viết mẫu để đảm bảo tính Idempotent khi chạy lại nhiều lần
    const samplePostIds = Array.from(postMap.values());
    if (samplePostIds.length > 0) {
      await client.query('DELETE FROM comments WHERE post_id = ANY($1::int[])', [samplePostIds]);
    }

    // Bài viết 1 (Event Loop) - Cây sâu 4 tầng để test tính năng đóng mở
    const post1Id = postMap.get('hieu-tuong-tan-event-loop-trong-javascript-tu-microtask-den-macrotask');
    const post2Id = postMap.get('react-server-components-vs-ssr-diem-khac-biet-cot-loi');
    const post3Id = postMap.get('toi-uu-hoa-truy-van-postgresql-voi-explain-analyze-va-composite-index');

    if (post1Id) {
      // 1. Root Comment A
      const rootResA = await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, NULL, 'approved', CURRENT_TIMESTAMP - INTERVAL '15 days')
        RETURNING id;
      `,
        [
          post1Id,
          userMap.get('quanghuy_dev'),
          'Bài viết giải thích về Microtask Queue rất sáng tỏ và trực quan! Trước đây mình cứ nghĩ setTimeout 0ms sẽ chạy ngay sau dòng lệnh trước nó.',
        ]
      );
      const rootAId = rootResA.rows[0].id;

      // 1.1 Reply B (Cấp 1 của A)
      const replyBRes = await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, $4, 'approved', CURRENT_TIMESTAMP - INTERVAL '14 days')
        RETURNING id;
      `,
        [
          post1Id,
          userMap.get('author_minhduc'),
          'Cảm ơn bạn Quang Huy! Bạn có thể lưu ý thêm là queueMicrotask() cũng được ưu tiên xử lý trước mọi macrotask giống hệt như Promise.then() nhé.',
          rootAId,
        ]
      );
      const replyBId = replyBRes.rows[0].id;

      // 1.1.1 Sub-reply C (Cấp 2 - Tầng 3 lồng nhau) -> Để test tính năng tự động gom từ tầng 3+
      const replyCRes = await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, $4, 'approved', CURRENT_TIMESTAMP - INTERVAL '13 days')
        RETURNING id;
      `,
        [
          post1Id,
          userMap.get('tuananh_frontend'),
          'Cho mình hỏi nếu trong Node.js thì setImmediate() và process.nextTick() sẽ xếp vào đâu trong hàng đợi này vậy tác giả?',
          replyBId,
        ]
      );
      const replyCId = replyCRes.rows[0].id;

      // 1.1.1.1 Sub-reply D (Cấp 3 - Tầng 4)
      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, $4, 'approved', CURRENT_TIMESTAMP - INTERVAL '12 days');
      `,
        [
          post1Id,
          userMap.get('author_minhduc'),
          'Trong Node.js, process.nextTick() chạy trước cả Microtask thông thường, còn setImmediate() thuộc Check Phase của Libuv chạy sau I/O Polling nhé bạn.',
          replyCId,
        ]
      );

      // 1.2 Reply E (Cấp 1 của A)
      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, $4, 'approved', CURRENT_TIMESTAMP - INTERVAL '14 days');
      `,
        [
          post1Id,
          userMap.get('nguyenmai_tech'),
          'Mình cũng vừa áp dụng kiến thức này để fix một con bug giật frame animation trên trang thanh toán. Rất cảm ơn tác giả!',
          rootAId,
        ]
      );

      // 2. Root Comment B (Độc giả khác)
      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, NULL, 'approved', CURRENT_TIMESTAMP - INTERVAL '10 days');
      `,
        [
          post1Id,
          userMap.get('vietdung_backend'),
          'Hình ảnh và sơ đồ minh họa rất đẹp và dễ hiểu. Mong tác giả ra thêm bài viết chuyên sâu về Garbage Collection trong V8 Engine.',
        ]
      );

      // 3. Root Comment C (Pending comment để test kiểm duyệt)
      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, NULL, 'pending', CURRENT_TIMESTAMP - INTERVAL '1 days');
      `,
        [
          post1Id,
          userMap.get('huonggiang_ui'),
          'Bình luận đang trong trạng thái chờ kiểm duyệt kiểm tra tính năng lọc Admin.',
        ]
      );
    }

    if (post2Id) {
      // Post 2: Cây có 3 phản hồi trực tiếp để test nút [Xem 3 phản hồi]
      const rootRes2 = await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, NULL, 'approved', CURRENT_TIMESTAMP - INTERVAL '20 days')
        RETURNING id;
      `,
        [
          post2Id,
          userMap.get('tuananh_frontend'),
          'Phần giải thích về Client Boundary ("use client") làm mình vỡ ra nhiều điều. Trước đây cứ tưởng component con của Client Component cũng thành Client hết.',
        ]
      );
      const root2Id = rootRes2.rows[0].id;

      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, $4, 'approved', CURRENT_TIMESTAMP - INTERVAL '19 days');
      `,
        [
          post2Id,
          userMap.get('author_thanhnga'),
          'Đúng vậy bạn, nếu truyền Server Component làm "children" của Client Component thì nó vẫn giữ nguyên tính chất chạy trên Server và 0KB JS bundle!',
          root2Id,
        ]
      );

      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, $4, 'approved', CURRENT_TIMESTAMP - INTERVAL '18 days');
      `,
        [
          post2Id,
          userMap.get('quanghuy_dev'),
          'Mẹo truyền children này cực kỳ hữu ích cho các layout có dialog modal hoặc drawer mở rộng.',
          root2Id,
        ]
      );

      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, $4, 'approved', CURRENT_TIMESTAMP - INTERVAL '17 days');
      `,
        [
          post2Id,
          userMap.get('editor_hoang'),
          'Đúng chuẩn pattern kiến trúc khuyến nghị của Vercel.',
          root2Id,
        ]
      );

      // Comment vi phạm bị ẩn (Hidden comment để test admin)
      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, NULL, 'hidden', CURRENT_TIMESTAMP - INTERVAL '5 days');
      `,
        [
          post2Id,
          userMap.get('thuha_cloud'),
          'Bình luận chứa nội dung spam đã bị quản trị viên ẩn đi.',
        ]
      );
    }

    if (post3Id) {
      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, NULL, 'approved', CURRENT_TIMESTAMP - INTERVAL '10 days');
      `,
        [
          post3Id,
          userMap.get('vietdung_backend'),
          'Lệnh EXPLAIN ANALYZE đã cứu sống hệ thống báo cáo bên mình tuần trước, giảm thời gian truy vấn từ 4 giây xuống còn 85 mili-giây.',
        ]
      );
    }

    // Thêm các bình luận rải rác trên các bài viết khác
    for (const [slug, postId] of postMap.entries()) {
      if (['hieu-tuong-tan-event-loop-trong-javascript-tu-microtask-den-macrotask', 'react-server-components-vs-ssr-diem-khac-biet-cot-loi', 'toi-uu-hoa-truy-van-postgresql-voi-explain-analyze-va-composite-index'].includes(slug)) {
        continue;
      }

      await client.query(
        `
        INSERT INTO comments (post_id, user_id, content, parent_id, status, created_at)
        VALUES ($1, $2, $3, NULL, 'approved', CURRENT_TIMESTAMP - INTERVAL '3 days');
      `,
        [
          postId,
          userMap.get('quanghuy_dev') || userMap.get('admin_baon'),
          'Bài viết trình bày rất gãy gọn, ví dụ thực tế và súc tích. Đánh giá 5 sao!',
        ]
      );
    }

    console.log('✅ Đã tạo thành công cây bình luận phân cấp và các trạng thái kiểm duyệt.');

    await client.query('COMMIT');
    console.log('🎉 TOÀN BỘ TIẾN TRÌNH SEED DATA ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi thực hiện SEED DATA (Đã ROLLBACK an toàn):', error);
    throw error;
  } finally {
    client.release();
    await db.pool.end();
  }
}

runSeed()
  .then(() => {
    console.log('✨ Xong! Hệ thống sẵn sàng cho demo và kiểm thử.');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
