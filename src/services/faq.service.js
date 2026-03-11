const httpStatus = require('http-status')
const ApiError = require("../utils/ApiError");
const { Faq } = require("../models/index");

const createFaq = async (data) => {
  try {
    return Faq.create(data);
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
  }
};

const getFaqs = async () => {
  try {

    return Faq.find({ isActive: true }).sort({ order: 1 });
  } catch (error) {
    throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
  }
};

const updateFaq = async (id, data) => {
  return Faq.findByIdAndUpdate(id, data, { new: true });
};

const deleteFaq = async (id) => {
  return Faq.findByIdAndDelete(id);
};

module.exports = {
  createFaq,
  getFaqs,
  updateFaq,
  deleteFaq
};