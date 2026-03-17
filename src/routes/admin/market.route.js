const express = require('express');
const router = express.Router();
const { marketController } = require('../../controllers/admin');

// Create
router.post('/', marketController.addMarket);

// Get all
router.get('/', marketController.getMarketsWithResult);

// Update
router.patch('/:id', marketController.updateMarket);

// Delete
router.delete('/:id', marketController.deleteMarket);

module.exports = router;