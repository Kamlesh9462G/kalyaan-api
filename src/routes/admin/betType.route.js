const express = require('express');
const router = express.Router();
const { betTypeController } = require('../../controllers/admin/index');


// // All routes require authentication
// router.use(auth());

// Get today's status
router.post('/', betTypeController.addBetType);
router.get('/', betTypeController.getBetTypes);

router.post('/:id/digits', betTypeController.addBetTypeDigits);
router.get('/:id/digits', betTypeController.getBetTypeDigits);

router.post('/:id/rates', betTypeController.addBetTypeRates);
router.get('/rates', betTypeController.getBetTypeRates);





module.exports = router;