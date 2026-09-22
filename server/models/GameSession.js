const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  player1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookingId1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  bookingId2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  gameType: {
    type: String,
    default: 'tictactoe',
  },
  boardState: {
    type: [String],
    default: () => Array(9).fill(''),
  },
  currentTurn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed'],
    default: 'waiting',
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GameSession', gameSessionSchema);
