const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Định dạng: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET
    if(!secret) throw new Error('JWT_SECRET is not configured');
    const decoded = jwt.verify(
      token,
      secret
    );
    req.user = decoded; // Dữ liệu mã hóa trong token: { id, username, role }
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'fail',
      message: 'Invalid or expired authentication token.',
    });
  }
};

// Middleware kiểm tra vai trò người dùng (hỗ trợ tương thích cả 'admin' và 'super_admin')
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access denied. Authentication required.',
      });
    }

    const currentRole = req.user.role;
    // Chuẩn hóa role: 'admin' tương đương 'super_admin'
    const isSuperAdmin = currentRole === 'super_admin' || currentRole === 'admin';
    const isAllowed =
      allowedRoles.includes(currentRole) ||
      (isSuperAdmin && (allowedRoles.includes('super_admin') || allowedRoles.includes('admin') || allowedRoles.includes('editor') || allowedRoles.includes('author')));

    if (!isAllowed) {
      return res.status(403).json({
        status: 'fail',
        message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}].`,
      });
    }

    next();
  };
};

// Các alias middleware thường dùng
const requireSuperAdmin = requireRole('super_admin', 'admin');
const requireEditorOrAbove = requireRole('super_admin', 'editor', 'admin');
const requireStaff = requireRole('super_admin', 'editor', 'author', 'admin');
// Middleware tùy chọn danh tính người dùng (nếu có gửi token thì giải mã, không thì coi như khách)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  try {
    const secret = process.env.JWT_SECRET;
    if (secret) {
      req.user = jwt.verify(token, secret);
    }
  } catch (error) {
    // Bỏ qua lỗi token hết hạn với route công khai
  }
  next();
};

// Alias hỗ trợ tương thích ngược
const requireAdmin = requireEditorOrAbove;

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireSuperAdmin,
  requireEditorOrAbove,
  requireStaff,
  requireAdmin,
};
