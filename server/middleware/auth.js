const jwt = require('jsonwebtoken');
const store = require('../models/store');

const JWT_SECRET = process.env.JWT_SECRET || 'ecosort_ai_super_secret_jwt_key_2026';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await store.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session: User no longer exists' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await store.findUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Ignore token error for optional auth
    }
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ success: false, message: 'Access denied: Municipal Administrator credentials required' });
  }
  next();
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Super Administrator credentials required' });
  }
  next();
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireSuperAdmin
};
