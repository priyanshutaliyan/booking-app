const User = require('../models/User.js');
const ProviderProfile = require('../models/ProviderProfile.js');
const Booking = require('../models/Booking.js');

const getStats = async (req, res) => {
  try {
    const [customers, providers, admins, suspended, bookings] =
      await Promise.all([
        User.countDocuments({ role: 'customer' }),
        User.countDocuments({ role: 'provider' }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ isSuspended: true }),
        Booking.countDocuments(),
      ]);

    return res
      .status(200)
      .json({ customers, providers, admins, suspended, bookings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const setUserSuspended = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User nahi mila' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin ko suspend nahi kar sakte' });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { isSuspended: Boolean(isSuspended) },
      { new: true }
    ).select('-password');

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find()
      .populate('userId', 'name email phone isSuspended')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(providers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const setProviderVerified = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const profile = await ProviderProfile.findByIdAndUpdate(
      id,
      { isVerified: Boolean(isVerified) },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Provider nahi mila' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  setUserSuspended,
  getAllProviders,
  setProviderVerified,
};