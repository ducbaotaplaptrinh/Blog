const contactService = require('../services/contactService');

class ContactController {
  // Public: Độc giả gửi liên hệ
  async submitContact(req, res, next) {
    try {
      const { name, email, subject, title, message } = req.body;
      const contact = await contactService.submitContact({ name, email, subject, title, message });

      res.status(201).json({
        status: 'success',
        message: 'Cảm ơn bạn! Ban biên tập đã tiếp nhận tin nhắn và sẽ phản hồi qua email sớm nhất.',
        data: { id: contact.id },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Lấy danh sách liên hệ
  async getContacts(req, res, next) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await contactService.getContacts({ status, search, page, limit });
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
      const stats = await contactService.getContactStats();
      res.status(200).json({
        status: 'success',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Xem chi tiết một liên hệ
  async getById(req, res, next) {
    try {
      const contact = await contactService.getContactById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { contact },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Cập nhật trạng thái xử lý
  async updateStatus(req, res, next) {
    try {
      const { status, admin_notes } = req.body;
      const contact = await contactService.updateStatus(req.params.id, { status, admin_notes }, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Cập nhật trạng thái liên hệ thành công.',
        data: { contact },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Xóa liên hệ
  async deleteContact(req, res, next) {
    try {
      await contactService.deleteContact(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Đã xóa thư liên hệ thành công.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContactController();
