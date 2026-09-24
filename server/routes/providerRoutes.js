const express = require('express');
const {
  createProviderProfile,
  getProvidersByCategory,
  getProvidersByUser,
  getProviderById,
  toggleActive,
} = require('../controllers/providerController.js');

const router = express.Router();

router.post('/', createProviderProfile);
router.get('/category/:category', getProvidersByCategory);
router.get('/user/:userId', getProvidersByUser);
router.put('/:id/active', toggleActive);
router.get('/:id', getProviderById);

module.exports = router;