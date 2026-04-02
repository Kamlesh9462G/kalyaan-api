const httpStatus = require('http-status');
const { ObjectId } = require('mongodb')
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { SupportTicket, TicketMessage } = require('../models');


// CREATE TICKET
const createTicket = async (ticketData) => {
    try {

        const ticket = await SupportTicket.create(ticketData);
        await TicketMessage.create({
            ticketId: ticket._id,
            senderType: "user",
            senderId: ticket.customerId,
            message: ticketData.description
        });

        return ticket;

    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
};



// USER REPLY
const replyToTicket = async ({ ticketId, senderId, message }) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Invalid ticket id");
        }

        const ticket = await SupportTicket.findById(ticketId);

        if (!ticket) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "Ticket not found");
        }

        if (ticket.status === "closed") {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Ticket already closed");
        }

        const reply = await TicketMessage.create({
            ticketId,
            senderType: "user",
            senderId,
            message
        });

        return reply;

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
};



const adminReplyToTicket = async ({ ticketId, adminId, message }) => {

    const ticket = await SupportTicket.findOne({ _id: new ObjectId(ticketId) });

    if (!ticket) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Ticket not found");
    }

    if (ticket.status === "closed") {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Ticket already closed");
    }

    const reply = await TicketMessage.create({
        ticketId,
        senderType: "admin",
        senderId: adminId,
        message
    });

    if (ticket.status === "open") {
        ticket.status = "in_progress";
        await ticket.save();
    }

    return reply;
};



// CLOSE TICKET (ADMIN)
const closeTicket = async (ticketId, adminId, remark) => {
    try {

        const ticket = await SupportTicket.findById(ticketId);

        if (!ticket) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "Ticket not found");
        }

        if (ticket.status === "closed") {
            throw new ApiError(httpStatus.status.BAD_REQUEST, "Ticket already closed");
        }

        if (remark) {
            await TicketMessage.create({
                ticketId,
                senderType: "admin",
                senderId: adminId,
                message: remark
            });
        }

        ticket.status = "closed";
        ticket.closedBy = adminId;
        ticket.closedAt = new Date();

        await ticket.save();

        return ticket;

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const updateTicketStatus = async (ticketId, status) => {

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
        throw new ApiError(httpStatus.status.NOT_FOUND, "Ticket not found");
    }

    if (ticket.status === "closed") {
        throw new ApiError(httpStatus.status.BAD_REQUEST, "Ticket already closed");
    }

    ticket.status = status;
    await ticket.save();

    return ticket;
}

const getTickets = async () => {
    return await SupportTicket.find();

}

// GET USER TICKETS
const getUserTickets = async (customerId, query) => {
    try {

        const { page = 1, limit = 10, status } = query;

        const filter = { customerId };

        if (status) {
            filter.status = status;
        }

        const tickets = await SupportTicket
            .find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await SupportTicket.countDocuments(filter);

        return {
            tickets,
            total,
            page: Number(page),
            limit: Number(limit)
        };

    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};



// GET TICKET CONVERSATION
const getTicketConversation = async (ticketId, customerId) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ticket id");
        }

        const ticket = await SupportTicket.findById(ticketId);

        if (!ticket) {
            throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
        }

        if (ticket.customerId.toString() !== customerId.toString()) {
            throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized ticket access");
        }

        const messages = await TicketMessage
            .find({ ticketId })
            .sort({ createdAt: 1 });

        return {
            ticket,
            messages
        };

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const getUserTicketsWithConversation = async (filterQuery) => {
    try {

        const tickets = await SupportTicket.aggregate([
            {
                $match: filterQuery
            },

            {
                $lookup: {
                    from: "ticketmessages",
                    localField: "_id",
                    foreignField: "ticketId",
                    as: "messages"
                }
            },

            {
                $addFields: {
                    messages: {
                        $sortArray: {
                            input: "$messages",
                            sortBy: { createdAt: 1 }
                        }
                    }
                }
            },

            {
                $sort: { createdAt: -1 }
            }

        ]);

        return tickets;

    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
};

module.exports = {
    createTicket,
    replyToTicket,
    adminReplyToTicket,
    closeTicket,
    getUserTickets,
    getTicketConversation,
    getUserTicketsWithConversation,
    getTickets,
    updateTicketStatus
};