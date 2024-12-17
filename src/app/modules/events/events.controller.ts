import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { eventServices } from "./events.servicel";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createEvents = catchAsync(async (req: Request, res: Response) => {

    const result = await eventServices.createEventsIntoDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Event create successfully!',
        data: result,
    });
})


export const eventController = {
    createEvents,
}