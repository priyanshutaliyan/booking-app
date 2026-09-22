const express = require('express');
const {
  createPayment,
  markAsPaid,
  getCustomerPayments,
} = require('../controllers/paymentController.js');

const router = express.Router();

router.post('/', createPayment);
router.get('/customer/:customerId', getCustomerPayments);
router.put('/:id/pay', markAsPaid);

module.exports = router;