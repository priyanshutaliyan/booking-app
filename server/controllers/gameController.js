const GameSession = require('../models/GameSession.js');
const User = require('../models/User.js');

const winningPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const hasWinner = (boardState) =>
  winningPatterns.some(
    ([first, second, third]) =>
      boardState[first] &&
      boardState[first] === boardState[second] &&
      boardState[first] === boardState[third]
  );

const checkGameStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const session = await GameSession.findOne({
      $or: [{ player1Id: userId }, { player2Id: userId }],
      status: { $in: ['waiting', 'in-progress'] },
    });

    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserCoins = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('appCoins');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ appCoins: user.appCoins });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const makeMove = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { position, userId } = req.body;
    const session = await GameSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ message: 'Game session is already completed' });
    }

    if (!session.currentTurn || !session.currentTurn.equals(userId)) {
      return res.status(400).json({ message: 'It is not this player\'s turn' });
    }

    if (!Number.isInteger(position) || position < 0 || position > 8) {
      return res.status(400).json({ message: 'Position must be between 0 and 8' });
    }

    if (session.boardState[position]) {
      return res.status(400).json({ message: 'This position is already occupied' });
    }

    const isPlayerOne = session.player1Id.equals(userId);
    const isPlayerTwo = session.player2Id.equals(userId);
    if (!isPlayerOne && !isPlayerTwo) {
      return res.status(400).json({ message: 'User is not a player in this session' });
    }

    session.boardState[position] = isPlayerOne ? 'X' : 'O';
    session.currentTurn = isPlayerOne ? session.player2Id : session.player1Id;
    session.status = 'in-progress';

    if (hasWinner(session.boardState)) {
      session.status = 'completed';
      session.winnerId = userId;

      const loserId = isPlayerOne ? session.player2Id : session.player1Id;
      await User.findByIdAndUpdate(userId, { $inc: { appCoins: 20 } });
      await User.findByIdAndUpdate(loserId, { $inc: { appCoins: 5 } });
    } else if (session.boardState.every((cell) => cell !== '')) {
      session.status = 'completed';
      session.winnerId = null;

      await User.findByIdAndUpdate(session.player1Id, { $inc: { appCoins: 10 } });
      await User.findByIdAndUpdate(session.player2Id, { $inc: { appCoins: 10 } });
    }

    await session.save();
    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getGameSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await GameSession.findById(sessionId)
      .populate('player1Id', 'name')
      .populate('player2Id', 'name');

    if (!session) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { checkGameStatus, getUserCoins, makeMove, getGameSession };