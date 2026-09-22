const express = require('express');
const {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  updateBookingStatus,
} = require('../controllers/bookingController.js');

const router = express.Router();

router.post('/', createBooking);
router.get('/customer/:customerId', getCustomerBookings);
router.get('/provider/:providerId', getProviderBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
