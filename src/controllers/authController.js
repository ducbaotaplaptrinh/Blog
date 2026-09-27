const authService = require('../services/authService');

class AuthController {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Username, email and password are required',
        });
      }

      const user = await authService.register({ username, email, password });
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Email and password are required',
        });
      }

      const result = await authService.login({ email, password });
      res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await authService.getProfile(userId);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/auth/change-password
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword({ userId, currentPassword, newPassword });
      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
