const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class AuthService {
  // Đăng ký người dùng mới
  async register({ username, email, password, role }) {
    // 1. Kiểm tra email đã tồn tại chưa
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email address is already in use');
    }

    // 2. Kiểm tra username đã tồn tại chưa
    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    // 3. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Lưu user vào DB (Mặc định luôn là role 'user', không tin role từ client)
    const newUser = await userRepository.create({
      username,
      email,
      password_hash,
      role: 'user',
    });

    return newUser;
  }

  // Đăng nhập
  async login({ email, password }) {
    // 1. Tìm user theo email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Email hoặc mật khẩu không chính xác');
      error.statusCode = 401;
      throw error;
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Email hoặc mật khẩu không chính xác');
      error.statusCode = 401;
      throw error;
    }

    // 3. Tạo JWT Token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  // Lấy thông tin cá nhân
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Đổi mật khẩu tài khoản
  async changePassword({ userId, currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      const error = new Error('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
      error.statusCode = 400;
      throw error;
    }

    if (currentPassword === newPassword) {
      const error = new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      const error = new Error('Người dùng không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    // So sánh mật khẩu hiện tại với hash trong CSDL
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      const error = new Error('Mật khẩu hiện tại không chính xác');
      error.statusCode = 400;
      throw error;
    }

    // Băm mật khẩu mới an toàn bằng bcrypt
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await userRepository.updatePassword(userId, newPasswordHash);

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }
}

module.exports = new AuthService();
