const express = require('express');
const router = express.Router();
const { quickActionController } = require('../../controllers/admin/index');


const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
// router.use(auth);

// Get today's status
router.post('/', quickActionController.addQuickAction);
router.get('/', quickActionController.getQuickActions);
router.patch('/:id', quickActionController.updateQuickAction);
router.delete('/:id', quickActionController.deleteQuickAction);



module.exports = router;