const Review = require('../models/Review.js');
const ProviderProfile = require('../models/ProviderProfile.js');

const createReview = async (req, res) => {
  try {
    const { bookingId, customerId, providerId, rating, comment } = req.body;
    const review = await Review.create({
      bookingId,
      customerId,
      providerId,
      rating,
      comment,
    });

    const reviews = await Review.find({ providerId });
    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((total, currentReview) => total + currentReview.rating, 0) /
      totalReviews;

    await ProviderProfile.findByIdAndUpdate(providerId, {
      rating: averageRating,
      totalReviews,
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const reviews = await Review.find({ providerId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCustomerReviews = async (req, res) => {
  try {
    const { customerId } = req.params;
    const reviews = await Review.find({ customerId });

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getProviderReviews, getCustomerReviews };