const Payment = require('../models/Payment.js');
const Booking = require('../models/Booking.js');

const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;
    const payment = await Payment.create({ bookingId, amount, method });

    return res.status(201).json(payment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        status: 'paid',
        paidAt: new Date(),
        transactionId: `TXN${Date.now()}`,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCustomerPayments = async (req, res) => {
  try {
    const { customerId } = req.params;
    const bookings = await Booking.find({ customerId }).select('_id');
    const payments = await Payment.find({
      bookingId: { $in: bookings.map((b) => b._id) },
    });

    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createPayment, markAsPaid, getCustomerPayments };