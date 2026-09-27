const crypto = require('crypto');
const newsletterRepository = require('../repositories/newsletterRepository');
const emailService = require('./emailService');

class NewsletterService {
  // 1. Độc giả đăng ký nhận bản tin
  async subscribe(email) {
    if (!email || !email.trim()) {
      const error = new Error('Vui lòng nhập địa chỉ email.');
      error.statusCode = 400;
      throw error;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      const error = new Error('Địa chỉ email không đúng định dạng.');
      error.statusCode = 400;
      throw error;
    }

    const existing = await newsletterRepository.findByEmail(cleanEmail);

    if (existing) {
      if (existing.status === 'active') {
        return {
          status: 'already_subscribed',
          message: 'Email này đã đăng ký theo dõi bản tin trước đó.',
          subscriber: existing,
        };
      }

      // Kích hoạt lại nếu từng hủy
      const reactivated = await newsletterRepository.reactivateSubscriber(cleanEmail);
      return {
        status: 'reactivated',
        message: 'Chào mừng bạn quay trở lại! Bản tin TechInsight đã được kích hoạt lại.',
        subscriber: reactivated,
      };
    }

    // Tạo mới với token ngẫu nhiên bảo mật
    const unsubscribe_token = crypto.randomBytes(24).toString('hex');
    const subscriber = await newsletterRepository.createSubscriber({
      email: cleanEmail,
      unsubscribe_token,
    });

    return {
      status: 'subscribed',
      message: 'Đăng ký thành công! Bạn sẽ nhận được thông báo khi có bài viết chuyên sâu mới.',
      subscriber,
    };
  }

  // 2. Hủy đăng ký bằng Token bảo mật
  async unsubscribe(token) {
    if (!token || !token.trim()) {
      const error = new Error('Mã xác thực hủy đăng ký không hợp lệ.');
      error.statusCode = 400;
      throw error;
    }

    const subscriber = await newsletterRepository.findByUnsubscribeToken(token.trim());
    if (!subscriber) {
      const error = new Error('Không tìm thấy thông tin đăng ký tương ứng với mã xác nhận này.');
      error.statusCode = 404;
      throw error;
    }

    await newsletterRepository.unsubscribeByToken(token.trim());
    return {
      message: 'Bạn đã hủy đăng ký nhận bản tin thành công.',
      email: subscriber.email,
    };
  }

  // 3. TỰ ĐỘNG GỬI BẢN TIN KHI BÀI VIẾT ĐƯỢC XUẤT BẢN (PUBLISHED)
  async triggerPostPublished(post) {
    // Rào cản tuyệt đối: Chỉ gửi khi bài viết thực sự là published
    if (!post || post.status !== 'published') {
      console.log(`⏩ [NEWSLETTER] Bỏ qua vì bài viết ID ${post?.id} có status = '${post?.status}' (không phải published).`);
      return;
    }

    // Chạy hoàn toàn bất đồng bộ trong background để không chặn HTTP response của Admin
    setImmediate(async () => {
      try {
        console.log(`🚀 [NEWSLETTER] Bắt đầu chiến dịch gửi bài mới ID: ${post.id} - "${post.title}"...`);
        const subscribers = await newsletterRepository.getActiveSubscribers();

        if (!subscribers || subscribers.length === 0) {
          console.log('ℹ️ [NEWSLETTER] Không có subscriber active nào trong hệ thống.');
          return;
        }

        console.log(`📬 [NEWSLETTER] Tìm thấy ${subscribers.length} độc giả active cần gửi.`);

        let sentCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        // Xử lý gửi theo từng lô nhỏ (Batch) để chống nghẽn và tôn trọng rate limit
        const BATCH_SIZE = 25;
        for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
          const batch = subscribers.slice(i, i + BATCH_SIZE);

          await Promise.allSettled(
            batch.map(async (sub) => {
              // 1. Kiểm tra chống gửi lặp bài viết cho cùng subscriber
              const existingDelivery = await newsletterRepository.findDelivery(post.id, sub.id);
              if (existingDelivery && existingDelivery.status === 'sent') {
                skippedCount++;
                return;
              }

              // 2. Gửi email
              try {
                await emailService.sendNewPostEmail({
                  toEmail: sub.email,
                  post,
                  unsubscribeToken: sub.unsubscribe_token,
                });

                await newsletterRepository.recordDelivery({
                  postId: post.id,
                  subscriberId: sub.id,
                  status: 'sent',
                });
                sentCount++;
              } catch (sendErr) {
                console.error(`⚠️ [NEWSLETTER] Lỗi khi gửi tới ${sub.email}:`, sendErr.message);
                await newsletterRepository.recordDelivery({
                  postId: post.id,
                  subscriberId: sub.id,
                  status: 'failed',
                  errorMessage: sendErr.message,
                });
                failedCount++;
              }
            })
          );

          // Nghỉ ngắn giữa các batch (300ms)
          if (i + BATCH_SIZE < subscribers.length) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }

        console.log(`🎉 [NEWSLETTER] Hoàn thành chiến dịch bài viết ID ${post.id}: ${sentCount} gửi thành công, ${skippedCount} đã bỏ qua do đã gửi trước, ${failedCount} thất bại.`);
      } catch (err) {
        console.error('💥 [NEWSLETTER] Lỗi nghiêm trọng trong background worker:', err);
      }
    });
  }

  // 4. Admin: Lấy danh sách Subscribers
  async getSubscribers({ status = 'all', search = '', page = 1, limit = 10 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const [subscribers, total] = await Promise.all([
      newsletterRepository.findAllSubscribers({ status, search, limit: limitNum, offset }),
      newsletterRepository.countSubscribers({ status, search }),
    ]);

    return {
      subscribers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  // 5. Admin: Lấy thống kê KPI
  async getStats() {
    return await newsletterRepository.getStats();
  }

  // 6. Admin: Lấy lịch sử gửi theo bài viết
  async getDeliveriesHistory({ page = 1, limit = 10 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    return await newsletterRepository.getDeliveriesHistory({ limit: limitNum, offset });
  }

  // 7. Admin: Hủy đăng ký theo ID
  async unsubscribeAdmin(id) {
    const updated = await newsletterRepository.unsubscribeById(id);
    if (!updated) {
      const error = new Error('Không tìm thấy người đăng ký này.');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  // 8. Admin: Xóa subscriber
  async deleteSubscriber(id, currentUser) {
    const isSuperAdmin = currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin');
    if (!isSuperAdmin) {
      const error = new Error('Chỉ Super Admin mới có quyền xóa người đăng ký.');
      error.statusCode = 403;
      throw error;
    }

    return await newsletterRepository.deleteSubscriber(id);
  }
}

module.exports = new NewsletterService();
