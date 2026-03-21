// validations/wallet.validation.js
const Joi = require('joi');

const validateWalletTransaction = (data) => {
  const schema = Joi.object({
    customerId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    amount: Joi.number().positive().max(1000000).required(),
    note: Joi.string().max(500).optional(),
    txnId: Joi.string().optional()
  });
  
  return schema.validate(data);
};

const validateDepositApproval = (data) => {
  const schema = Joi.object({
    remark: Joi.string().max(500).optional()
  });
  
  return schema.validate(data);
};

module.exports = {
  validateWalletTransaction,
  validateDepositApproval
};