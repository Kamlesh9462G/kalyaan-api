const express = require('express');
const router = express.Router();
const { marketBetTypeController } = require('../../controllers/admin');

// CREATE
router.post('/', marketBetTypeController.addMarketBetType);

// GET ALL
router.get('/', marketBetTypeController.getMarketBetType);

// GET BY MARKET (optional but useful)
router.get('/market/:marketId', marketBetTypeController.getMarketBetTypes);

// UPDATE
router.patch('/:id', marketBetTypeController.updateMarketBetType);

// DELETE (soft delete recommended)
router.delete('/:id', marketBetTypeController.deleteMarketBetType);

module.exports = router;