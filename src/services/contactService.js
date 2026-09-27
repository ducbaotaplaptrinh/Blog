const contactRepository = require('../repositories/contactRepository');

class ContactService {
  // Độc giả gửi liên hệ mới
  async submitContact({ name, email, subject, title, message }) {
    if (!name || !name.trim()) {
      const error = new Error('Vui lòng nhập họ và tên của bạn.');
      error.statusCode = 400;
      throw error;
    }

    if (!email || !email.trim()) {
      const error = new Error('Vui lòng nhập địa chỉ email hợp lệ.');
      error.statusCode = 400;
      throw error;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const error = new Error('Địa chỉ email không đúng định dạng.');
      error.statusCode = 400;
      throw error;
    }

    if (!message || message.trim().length < 10) {
      const error = new Error('Nội dung tin nhắn cần tối thiểu 10 ký tự.');
      error.statusCode = 400;
      throw error;
    }

    const validSubjectTypes = ['feedback', 'technical', 'topic_request', 'collaboration', 'copyright', 'other'];
    const resolvedSubject = validSubjectTypes.includes(subject) ? subject : 'feedback';

    return await contactRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject_type: resolvedSubject,
      title: title ? title.trim() : `[Liên hệ ${resolvedSubject}] từ ${name.trim()}`,
      message: message.trim(),
    });
  }

  // Lấy danh sách liên hệ cho Admin Inbox
  async getContacts({ status = 'all', search = '', page = 1, limit = 10 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      contactRepository.findAll({ status, search, limit: limitNum, offset }),
      contactRepository.countAll({ status, search }),
    ]);

    return {
      contacts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  // Thống kê số lượng theo trạng thái
  async getContactStats() {
    return await contactRepository.getStats();
  }

  // Xem chi tiết liên hệ
  async getContactById(id) {
    const contact = await contactRepository.findById(id);
    if (!contact) {
      const error = new Error('Không tìm thấy thông tin liên hệ này.');
      error.statusCode = 404;
      throw error;
    }
    return contact;
  }

  // Cập nhật trạng thái xử lý thư liên hệ
  async updateStatus(id, { status, admin_notes }, currentUser) {
    const contact = await contactRepository.findById(id);
    if (!contact) {
      const error = new Error('Không tìm thấy thông tin liên hệ này.');
      error.statusCode = 404;
      throw error;
    }

    const validStatuses = ['new', 'in_progress', 'resolved', 'spam'];
    if (status && !validStatuses.includes(status)) {
      const error = new Error(`Trạng thái "${status}" không hợp lệ.`);
      error.statusCode = 400;
      throw error;
    }

    return await contactRepository.updateStatus(id, {
      status,
      admin_notes,
      assigned_to: currentUser ? currentUser.id : null,
    });
  }

  // Xóa thư liên hệ (chỉ Super Admin)
  async deleteContact(id, currentUser) {
    const isSuperAdmin = currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin');
    if (!isSuperAdmin) {
      const error = new Error('Chỉ Super Admin mới có quyền xóa thư liên hệ.');
      error.statusCode = 403;
      throw error;
    }

    const contact = await contactRepository.findById(id);
    if (!contact) {
      const error = new Error('Không tìm thấy thông tin liên hệ để xóa.');
      error.statusCode = 404;
      throw error;
    }

    return await contactRepository.delete(id);
  }
}

module.exports = new ContactService();
