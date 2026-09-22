const express = require('express');
const {
  checkGameStatus,
  getUserCoins,
  makeMove,
  getGameSession,
} = require('../controllers/gameController.js');

const router = express.Router();

router.get('/status/:userId', checkGameStatus);
router.get('/coins/:userId', getUserCoins);
router.put('/:sessionId/move', makeMove);
router.get('/:sessionId', getGameSession);

module.exports = router;