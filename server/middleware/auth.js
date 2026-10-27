import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pawpair_super_secret_jwt_key_2026_production_ready';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const sendTokenCookie = (user, res, statusCode = 200) => {
  const token = signToken(user.id || user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('token', token, cookieOptions);

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj._id;
  delete userObj.__v;

  return res.status(statusCode).json({
    success: true,
    user: userObj,
  });
};

export const requireAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please sign in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session. Please sign in again.' });
  }
};

export const requireShelterStaff = (req, res, next) => {
  if (!req.user || req.user.role !== 'shelter_staff') {
    return res.status(403).json({ message: 'Access denied: Shelter staff role required.' });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        req.user = currentUser;
      }
    }
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
};
