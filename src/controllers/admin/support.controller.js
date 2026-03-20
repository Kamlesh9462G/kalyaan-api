
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { supportService } = require('../../services/index');

const adminReplyToTicket = catchAsync(async (req, res) => {

    const data = await supportService.adminReplyToTicket({
        ticketId: req.params.ticketId,
        adminId: "69ae7796bca0a2ddab073fdf",
        message: req.body.message
    });

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Reply sent successfully",
        data
    });
});
const getTickets = catchAsync(async (req, res) => {
    let filterQuery = {};
    const data = await supportService.getUserTicketsWithConversation(filterQuery);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Tickets fetched successfully",
        data
    });
})
module.exports = {
    adminReplyToTicket,
    getTickets
}