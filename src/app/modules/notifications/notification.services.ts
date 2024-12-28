import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import NotificationModel from "./notification.model";
import { INotification } from "./notification.interface";
import { Server, ServerOptions } from "socket.io";

const markNotificationAsRead = async (notificationId: string, io: ServerOptions) => {
    const result = await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });

    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
    }

    return result;
};


const sendNotificationToUser = async (payload: INotification, io: Server) => {
    const result = await NotificationModel.create(payload);

    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to send notification!');
    }

    io.emit(`New notification::${result.receiverId.toString()}`, result)

    return result;
};

const getAllNotificationOfReciver = async (receiverId: string) => {
    const result = await NotificationModel.find({ receiverId: receiverId }).sort("-createdAt");

    const count = await NotificationModel.countDocuments({
        receiverId: receiverId,
        isRead: false,
    });

    return { result, unRead: count };
}


export const NotificationServices = {
    markNotificationAsRead,
    sendNotificationToUser,
    getAllNotificationOfReciver,
}