const express = require('express');
const router = express.Router();
const { betTypeController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', betTypeController.addBetType);
router.get('/', betTypeController.getBetTypes);
router.patch('/:id', betTypeController.updateBetType);
router.delete('/:id', betTypeController.deleteBetType);

router.post('/:id/digits', betTypeController.addBetTypeDigits);
router.get('/:id/digits', betTypeController.getBetTypeDigits);

router.post('/rates', betTypeController.addBetTypeRates);
router.patch('/rates', betTypeController.updateBetTypeRate);
router.delete('/rates', betTypeController.deleteBetTypeRate);

router.get('/rates', betTypeController.getBetTypeRates);





module.exports = router;