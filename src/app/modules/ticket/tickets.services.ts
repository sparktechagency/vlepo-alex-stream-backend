import { TicketModel } from "./tickets.model"

const getSelfTicket = async (userId: string) => {
    const tickets = await TicketModel.find({ createdBy: userId }).sort("-createdAt");

    return tickets;
}

export const TicketServices = {
    getSelfTicket,
}