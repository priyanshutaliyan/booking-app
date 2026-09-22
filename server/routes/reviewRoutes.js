const express = require('express');
const {
  createReview,
  getProviderReviews,
  getCustomerReviews,
} = require('../controllers/reviewController.js');

const router = express.Router();

router.post('/', createReview);
router.get('/provider/:providerId', getProviderReviews);
router.get('/customer/:customerId', getCustomerReviews);

module.exports = router;