const Booking = require('../models/Booking.js');
const User = require('../models/User.js');
const ProviderProfile = require('../models/ProviderProfile.js');

const createBooking = async (req, res) => {
  try {
    const { customerId, providerId, slotDate, slotTime, price, address } = req.body;

    // Rule 1: sirf customer booking kar sakta hai
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'User nahi mila' });
    }
    if (customer.role !== 'customer') {
      return res
        .status(403)
        .json({ message: 'Sirf customer hi booking kar sakte hain' });
    }

    // Rule 2: apni hi service book nahi kar sakte
    const provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider nahi mila' });
    }
    if (provider.userId.equals(customerId)) {
      return res
        .status(400)
        .json({ message: 'Aap apni hi service book nahi kar sakte' });
    }

    // Same provider, same date, same time pe koi active booking to nahi hai
    const alreadyBooked = await Booking.findOne({
      providerId,
      slotDate,
      slotTime,
      status: { $ne: 'cancelled' },
    });

    if (alreadyBooked) {
      return res.status(400).json({
        message: 'Ye slot pehle se book ho chuka hai, doosra slot chuno',
      });
    }

    const booking = await Booking.create({
      customerId,
      providerId,
      slotDate,
      slotTime,
      price,
      address,
    });

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;
    const bookings = await Booking.find({ customerId })
      .populate('providerId', 'serviceName pricePerService')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProviderBookings = async (req, res) => {
  try {
    const { providerId } = req.params;
    const bookings = await Booking.find({ providerId })
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  updateBookingStatus,
};