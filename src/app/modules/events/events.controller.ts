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
});

const getSingleEventByEventId = catchAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const result = await eventServices.getSingleEventByEventId(eventId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Event retrived successfully!',
        data: result,
    });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {

    const result = await eventServices.getAllEvents(req.query);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Events retrived successfully!',
        data: result,
    });
});

const findSaveEvent = catchAsync(async (req: Request, res: Response) => {
    const {id} = req.user;

    const result = await eventServices.findSaveEvent(id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Events retrived successfully!',
        data: result,
    });
});



export const eventController = {
    createEvents,
    getSingleEventByEventId,
    getAllEvents,
    findSaveEvent,
    
}