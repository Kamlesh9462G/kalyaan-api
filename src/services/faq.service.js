const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Faq } = require("../models");

const createFaq = async (data) => {
  return Faq.create(data);
};

const getFaqs = async () => {

  return await Faq.find({});
  const skip = (page - 1) * limit;

  const [faqs, total] = await Promise.all([
    Faq.find({ isActive: true })
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Faq.countDocuments({ isActive: true })
  ]);

  return {
    results: faqs,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

const updateFaq = async (id, data) => {
  const faq = await Faq.findByIdAndUpdate(id, data, { new: true });

  if (!faq) {
    throw new ApiError(httpStatus.status.NOT_FOUND, "FAQ not found");
  }

  return faq;
};

const deleteFaq = async (id) => {
  // ✅ SOFT DELETE (Recommended)
  const faq = await Faq.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!faq) {
    throw new ApiError(httpStatus.status.NOT_FOUND, "FAQ not found");
  }

  return faq;
};

module.exports = {
  createFaq,
  getFaqs,
  updateFaq,
  deleteFaq
};