import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { NotificationServices } from "./notification.services";

const markNotificationAsRead = catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    // @ts-ignore
    const io = global.io;
    const result = await NotificationServices.markNotificationAsRead(notificationId, io);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Mark read notification successfully!',
        data: result,
    });
});

const sendNotificationToUser = catchAsync(async (req, res) => {
    // @ts-ignore
    const io = global.io;

    const result = await NotificationServices.sendNotificationToUser(req.body, io);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Notification send successfully!',
        data: result,
    });
});

const sendNotificationToAll = catchAsync(async (req, res) => {
    // @ts-ignore
    const io = global.io;
    const { id: senderId } = req.user;

    const result = await NotificationServices.sendNotificationToAll(senderId, req.body, io);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Notification send successfully!',
        data: result,
    });
});


const getAllNotificationOfReciver = catchAsync(async (req, res) => {
    const { id: receiverId } = req.user;
    const result = await NotificationServices.getAllNotificationOfReciver(receiverId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Notification retrived successfully!',
        data: result,
    });
});


const deleteAllMyNotification = catchAsync(async (req, res) => {
    const { id } = req.user;
    const result = await NotificationServices.deleteAllMyNotification(id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Notification deleted successfully!',
        data: result,
    });
});


export const NotificationController = {
    markNotificationAsRead,
    sendNotificationToUser,
    getAllNotificationOfReciver,
    sendNotificationToAll,
    deleteAllMyNotification,
}