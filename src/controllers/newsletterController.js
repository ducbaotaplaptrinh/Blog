const newsletterService = require('../services/newsletterService');

class NewsletterController {
  // Public: Đăng ký nhận tin
  async subscribe(req, res, next) {
    try {
      const { email } = req.body;
      const result = await newsletterService.subscribe(email);

      const statusCode = result.status === 'subscribed' ? 201 : 200;
      res.status(statusCode).json({
        status: 'success',
        message: result.message,
        data: { subscriber: result.subscriber },
      });
    } catch (error) {
      next(error);
    }
  }

  // Public: Hủy đăng ký bằng Token
  async unsubscribe(req, res, next) {
    try {
      const { token } = req.query;
      const result = await newsletterService.unsubscribe(token);
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: { email: result.email },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Lấy danh sách subscribers
  async getSubscribers(req, res, next) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await newsletterService.getSubscribers({ status, search, page, limit });
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Lấy thống kê KPI
  async getStats(req, res, next) {
    try {
      const stats = await newsletterService.getStats();
      res.status(200).json({
        status: 'success',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Lịch sử gửi theo bài viết
  async getDeliveries(req, res, next) {
    try {
      const { page, limit } = req.query;
      const deliveries = await newsletterService.getDeliveriesHistory({ page, limit });
      res.status(200).json({
        status: 'success',
        data: { deliveries },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Hủy đăng ký
  async unsubscribeAdmin(req, res, next) {
    try {
      const subscriber = await newsletterService.unsubscribeAdmin(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Đã hủy đăng ký bản tin cho email này.',
        data: { subscriber },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Xóa subscriber
  async deleteSubscriber(req, res, next) {
    try {
      await newsletterService.deleteSubscriber(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Đã xóa người đăng ký thành công.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NewsletterController();
