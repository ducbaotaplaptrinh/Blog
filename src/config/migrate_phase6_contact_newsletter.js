const { pool } = require('./db');
const crypto = require('crypto');

async function migratePhase6() {
  const client = await pool.connect();
  try {
    console.log('🔄 Bắt đầu Migration Phase 6: contacts, newsletter_subscribers & newsletter_deliveries...');
    await client.query('BEGIN');

    // 1. Tạo bảng contacts
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject_type VARCHAR(50) NOT NULL DEFAULT 'feedback',
        title VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        admin_notes TEXT,
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
      CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
    `);

    // 2. Tạo bảng newsletter_subscribers
    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(150) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'pending')),
        unsubscribe_token VARCHAR(100) UNIQUE NOT NULL,
        confirmation_token VARCHAR(100),
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP WITH TIME ZONE,
        unsubscribed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_token ON newsletter_subscribers(unsubscribe_token);
    `);

    // 3. Tạo bảng newsletter_deliveries
    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_deliveries (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        subscriber_id INTEGER REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
        attempts INTEGER DEFAULT 1,
        error_message TEXT,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_post_subscriber UNIQUE (post_id, subscriber_id)
      );

      CREATE INDEX IF NOT EXISTS idx_deliveries_post_id ON newsletter_deliveries(post_id);
      CREATE INDEX IF NOT EXISTS idx_deliveries_subscriber_id ON newsletter_deliveries(subscriber_id);
    `);

    // 4. Seed dữ liệu mẫu ban đầu nếu bảng còn trống để Admin có dữ liệu thực tế
    const checkContacts = await client.query('SELECT COUNT(*) FROM contacts');
    if (parseInt(checkContacts.rows[0].count, 10) === 0) {
      console.log('🌱 Đang chèn dữ liệu mẫu cho contacts...');
      await client.query(`
        INSERT INTO contacts (name, email, subject_type, title, message, status, created_at)
        VALUES 
          ('Lê Hoàng Nam', 'hoangnam.le@gmail.com', 'topic_request', 'Đề xuất phân tích về Event-driven Architecture', 'Chào ban biên tập, mình rất thích chuỗi bài viết kiến trúc của TechInsight. Rất mong ban biên tập có thể làm thêm bài phân tích chuyên sâu về Apache Kafka vs RabbitMQ trong hệ thống microservices quy mô lớn.', 'new', NOW() - INTERVAL '2 hours'),
          ('Nguyễn Thị Mai', 'mai.nguyen@fpt.com', 'collaboration', 'Đề xuất hợp tác chuyên môn & phỏng vấn', 'Mình là Lead Engineer tại FPT Software. Mình có theo dõi bài phân tích React 19 của TechInsight và muốn gửi bài viết đóng góp về trải nghiệm áp dụng thực tế tại dự án.', 'new', NOW() - INTERVAL '5 hours'),
          ('Phạm Minh Quân', 'quan.pham@techcorp.vn', 'technical', 'Báo lỗi hiển thị bảng so sánh trên Mobile', 'Chào ban biên tập, khi mình xem bài viết Performance Optimization trên iPhone 14 Pro Max thì phần bảng dữ liệu bị tràn màn hình một chút, mong các bạn hỗ trợ.', 'in_progress', NOW() - INTERVAL '1 day'),
          ('Trần Quốc Tuấn', 'tuan.tran@vng.com.vn', 'feedback', 'Góp ý về giải pháp phân mảnh PostgreSQL', 'Bài viết rất bổ ích! Ở phần Table Partitioning nếu bổ sung thêm ví dụ về Partition by Range theo năm sẽ còn tuyệt vời hơn nữa.', 'resolved', NOW() - INTERVAL '3 days');
      `);
    }

    const checkSubscribers = await client.query('SELECT COUNT(*) FROM newsletter_subscribers');
    if (parseInt(checkSubscribers.rows[0].count, 10) === 0) {
      console.log('🌱 Đang chèn dữ liệu mẫu cho newsletter_subscribers...');
      const sampleEmails = [
        'kien.truc.dev@gmail.com',
        'backend.engineer@vng.com.vn',
        'developer.hanoi@outlook.com',
        'techlead.saigon@yahoo.com',
        'reader.community@techinsight.dev'
      ];

      for (const email of sampleEmails) {
        const token = crypto.randomBytes(24).toString('hex');
        await client.query(`
          INSERT INTO newsletter_subscribers (email, status, unsubscribe_token, subscribed_at)
          VALUES ($1, 'active', $2, NOW() - INTERVAL '4 days')
        `, [email, token]);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Migration Phase 6 thành công mỹ mãn!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi Migration Phase 6:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migratePhase6();
