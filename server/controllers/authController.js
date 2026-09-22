const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userWithoutPassword = (user) => {
  const { password, ...userInfo } = user.toObject();
  return userInfo;
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Register se sirf customer ya provider ban sakta hai, admin nahi
    const safeRole = role === 'provider' ? 'provider' : 'customer';

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: safeRole,
      phone,
    });
    const token = createToken(user._id);

    return res.status(201).json({
      user: userWithoutPassword(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Suspend kiya hua user login nahi kar sakta
    if (user.isSuspended) {
      return res.status(403).json({
        message: 'Aapka account suspend kar diya gaya hai. Admin se sampark karo.',
      });
    }

    const token = createToken(user._id);
    return res.status(200).json({
      user: userWithoutPassword(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };