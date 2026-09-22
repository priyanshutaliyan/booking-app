const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  },
  description: String,
  pricePerService: {
    type: Number,
    required: true,
  },
  availability: [
    {
      date: String,
      timeSlots: [String],
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
