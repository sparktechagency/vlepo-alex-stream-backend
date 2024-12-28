import { TicketModel } from "./tickets.model"

const getSelfTicket = async (userId: string) => {
    const tickets = await TicketModel.find({ createdBy: userId }).sort("-createdAt");

    return tickets;
}

const getSingleTicket = async (ticketId: string) => {
    const ticket = await TicketModel.findById(ticketId)
        .populate("eventId", "image eventName ticketPrice soldTicket");

    return ticket;
}

export const TicketServices = {
    getSelfTicket,
    getSingleTicket,
}