import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { eventServices } from "./events.services";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createEvents = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user;
    const result = await eventServices.createEventsIntoDB(id, req.body);

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


const getSingleSlfEventAnalysisByEventId = catchAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { timeframe } = req.query;

    const result = await eventServices.getSingleSlfEventAnalysisByEventId(eventId, timeframe as string);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Event analysis retrived successfully!',
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


// find all the events which categories is select user
const getMyFavouriteEvents = catchAsync(async (req: Request, res: Response) => {
    const {id} = req.user;
    const result = await eventServices.getMyFavouriteEvents(req.query, id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Selected categories events retrived successfully!',
        data: result,
    });
});

const getAllEventsOfCreator = catchAsync(async (req: Request, res: Response) => {
    const { creatorId } = req.params;

    const result = await eventServices.getAllEventsOfCreator(req.query, creatorId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User events retrived successfully!',
        data: result,
    });
});


const cancelMyEventById = catchAsync(async (req: Request, res: Response) => {
    const { id: creatorId } = req.user;
    const { eventId } = req.params;

    const result = await eventServices.cancelMyEventById(eventId, creatorId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User events retrived successfully!',
        data: result,
    });
});


const creatorEventOverview = catchAsync(async (req: Request, res: Response) => {
    const { id: creatorId } = req.user;

    const result = await eventServices.creatorEventOverview(creatorId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Creator events analysis data retrived successfully!',
        data: result,
    });
});


const updateAllEventsTrendingStatus = async () => {
    try {
        await eventServices.updateAllEventsTrendingStatus();
    } catch (error) {
        console.error("Error in scheduled task:", error);
    }
};





export const eventController = {
    createEvents,
    getSingleEventByEventId,
    getAllEvents,
    getAllEventsOfCreator,
    cancelMyEventById,
    updateAllEventsTrendingStatus,
    getSingleSlfEventAnalysisByEventId,
    creatorEventOverview,
    getMyFavouriteEvents,
}    