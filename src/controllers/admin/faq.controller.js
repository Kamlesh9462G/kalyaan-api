const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { faqService } = require("../../services/index");

const createFaq = catchAsync(async (req, res) => {

  const result = await faqService.createFaq(req.body);

  res.status(httpStatus.status.CREATED).send({
    success: true,
    message: "FAQ created successfully",
    data: result
  });

});

const getFaqs = catchAsync(async (req, res) => {

  const result = await faqService.getFaqs();

  res.send({
    success: true,
    data: result
  });

});

const updateFaq = catchAsync(async (req, res) => {

  const result = await faqService.updateFaq(req.params.id, req.body);

  res.send({
    success: true,
    message: "FAQ updated successfully",
    data: result
  });

});

const deleteFaq = catchAsync(async (req, res) => {

  await faqService.deleteFaq(req.params.id);

  res.send({
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