const express = require('express');
const router = express.Router();
const { sidebarController } = require('../../controllers/admin/index');


// const { auth, requireSuperAdmin } = require('../../middlewares/admin/auth.middleware');
// router.use(auth);

// Get today's status
router.post('/', sidebarController.addSidebar);
router.get('/', sidebarController.getSidebars);
router.patch('/:id', sidebarController.updateSidebar);
router.delete('/:id', sidebarController.deleteSidebar);




module.exports = router;