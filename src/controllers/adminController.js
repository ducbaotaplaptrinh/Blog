const adminService = require('../services/adminService');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const data = await adminService.getDashboardStats();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await adminService.getAllUsers();
      res.status(200).json({ status: 'success', data: { users } });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const data = await adminService.getUserDetail(req.params.id);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const updatedUser = await adminService.updateUserRole(req.params.id, role, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Cập nhật vai trò người dùng thành công',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
