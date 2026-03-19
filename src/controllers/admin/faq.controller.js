const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { faqService } = require("../../services");

const createFaq = catchAsync(async (req, res) => {
  const faq = await faqService.createFaq(req.body);

  res.status(httpStatus.status.CREATED).send({
    success: true,
    message: "FAQ created successfully",
    data: faq
  });
});

const getFaqs = catchAsync(async (req, res) => {
  const { page, limit } = req.query;

  const result = await faqService.getFaqs({ page, limit });

  res.status(httpStatus.status.OK).send({
    success: true,
    data: result
  });
});

const updateFaq = catchAsync(async (req, res) => {
  const faq = await faqService.updateFaq(req.params.id, req.body);

  res.status(httpStatus.status.OK).send({
    success: true,
    message: "FAQ updated successfully",
    data: faq
  });
});

const deleteFaq = catchAsync(async (req, res) => {
  await faqService.deleteFaq(req.params.id);

  res.status(httpStatus.status.OK).send({
    success: true,
    message: "FAQ deleted successfully"
  });
});

module.exports = {
  createFaq,
  getFaqs,
  updateFaq,
  deleteFaq
};