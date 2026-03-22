const express = require('express');
const router = express.Router();
const { accountController } = require('../../controllers/admin/index');




router.patch("/bank", accountController.updateBankAccount)


router.patch("/upi", accountController.updateUpiAccount)

module.exports = router;