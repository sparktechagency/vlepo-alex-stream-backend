import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserEventServices } from "./userevents.services";

const createUserEvent = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user;

    const result = await UserEventServices.createUserEventIntoDB(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User event save successfully',
        data: result,
    });
});


const getEventsFilterByType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user;

    const result = await UserEventServices.getEventsFilterByType(id, req.query);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User event retrived successfully',
        data: result,
    });
});

const deleteUserEvent = catchAsync(async (req: Request, res: Response) => {
    const { userEventId } = req.params;

    const result = await UserEventServices.deleteUserEvent(userEventId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User event deleted successfully',
        data: result,
    });
});



export const UserEventController = {
    createUserEvent,
    getEventsFilterByType,
    deleteUserEvent
};