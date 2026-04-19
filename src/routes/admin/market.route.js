const express = require('express');
const router = express.Router();
const { marketController } = require('../../controllers/admin');


const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
// router.use(auth);


// Create
router.post('/', marketController.addMarket);

// Get all
router.get('/', marketController.getMarketsWithResult);

// Update
router.patch('/:id', marketController.updateMarket);

// Delete
router.delete('/:id', marketController.deleteMarket);

module.exports = router;