const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// Token check: login hai ya nahi, aur account suspend to nahi
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Login zaroori hai (token nahi mila)' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User nahi mila' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Aapka account suspend hai' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token galat ya expire ho gaya' });
  }
};

// Sirf admin ko ijazat
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Ye kaam sirf admin kar sakta hai' });
  }
  next();
};

module.exports = { protect, adminOnly };