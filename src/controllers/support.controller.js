
const httpStatus = require('http-status');
const {ObjectId} = require('mongodb')
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { supportService } = require('../services/index');

const createTicket = async (req, res) => {
    console.log(req.body)
    console.log(req.customer)
    req.body["customerId"] = req.customer.customerId;

    const data = await supportService.createTicket(req.body);

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Ticket created successfully",
        data: data
    });
}
const replyToTicket = async (req, res) => {

    const data = await supportService.replyToTicket({
        ticketId: req.params.ticketId,
        senderId: "69ae7796bca0a2ddab073fdf",
        message: req.body.message
    });

    return res.status(httpStatus.status.OK).json({
        success: true,
        status: httpStatus.status.OK,
        message: "Message sent successfully",
        data: data
    });

}
const getTickets = catchAsync(async (req, res) => {

    const customerId = req.customer.customerId;

    let filterQuery = {};
    filterQuery["customerId"] = new ObjectId(customerId)

    const tickets = await supportService.getUserTicketsWithConversation(filterQuery);

    res.status(httpStatus.status.OK).json({
        success: true,
        message: "Tickets fetched successfully",
        data: tickets
    });

});
module.exports = {
    createTicket,
    replyToTicket,
    getTickets
}
