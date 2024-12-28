import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { TicketServices } from "./tickets.services";

const gerSelfTickets = catchAsync(async (req, res) => {
    const { id } = req.user;

    const result = await TicketServices.getSelfTicket(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Retrived my tickets!',
        data: result,
    });
});


export const TicketsController = {
    gerSelfTickets,
};