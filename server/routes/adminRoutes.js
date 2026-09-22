const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware.js');
const {
  getStats,
  getAllUsers,
  setUserSuspended,
  getAllProviders,
  setProviderVerified,
} = require('../controllers/adminController.js');

const router = express.Router();

// Is file ke saare routes pe pehle token aur admin ka check lagega
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', setUserSuspended);
router.get('/providers', getAllProviders);
router.put('/providers/:id/verify', setProviderVerified);

module.exports = router;