import User from '../models/User.js';
import { sendTokenCookie } from '../middleware/auth.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, city, phone, shelterId } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      password,
      role: role || 'adopter',
      city: city || '',
      phone: phone || '',
      shelterId: shelterId || null,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
    });

    return sendTokenCookie(user, res, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    // If password provided, compare
    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
      }
    }

    return sendTokenCookie(user, res, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const demoSwitch = async (req, res, next) => {
  try {
    const { userId, email } = req.body;
    let query = {};
    if (userId) query = { _id: userId };
    else if (email) query = { email: email.toLowerCase().trim() };
    else {
      return res.status(400).json({ message: 'userId or email is required for demo switch' });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ message: 'Demo persona user not found' });
    }

    return sendTokenCookie(user, res, 200);
  } catch (error) {
    next(error);
  }
};

export const getDemoUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).lean();
    return res.status(200).json({
      success: true,
      users: users.map((u) => {
        const { password, _id, __v, ...rest } = u;
        return { id: _id, ...rest };
      }),
    });
  } catch (error) {
    next(error);
  }
};
