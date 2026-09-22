const express = require('express');
const {
  createProviderProfile,
  getProvidersByCategory,
  getProvidersByUser,
  getProviderById,
} = require('../controllers/providerController.js');

const router = express.Router();

router.post('/', createProviderProfile);
router.get('/category/:category', getProvidersByCategory);
router.get('/user/:userId', getProvidersByUser);
router.get('/:id', getProviderById);

module.exports = router;