const ProviderProfile = require('../models/ProviderProfile.js');

const createProviderProfile = async (req, res) => {
  try {
    const {
      userId,
      category,
      serviceName,
      description,
      pricePerService,
      timeSlots,
    } = req.body;

    const profile = await ProviderProfile.create({
      userId,
      category,
      serviceName,
      description,
      pricePerService,
      timeSlots,
    });

    return res.status(201).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProvidersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const providers = await ProviderProfile.find({ category, isActive: true })
      .populate('userId', 'name phone')
      .populate('category', 'name');

    return res.status(200).json(providers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProvidersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const profiles = await ProviderProfile.find({ userId }).populate(
      'category',
      'name'
    );

    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await ProviderProfile.findById(id)
      .populate('userId', 'name phone')
      .populate('category', 'name');

    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const profile = await ProviderProfile.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProviderProfile,
  getProvidersByCategory,
  getProvidersByUser,
  getProviderById,
  toggleActive,
};