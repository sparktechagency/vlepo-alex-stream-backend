import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import NotificationModel from "./notification.model";
import { INotification } from "./notification.interface";
import { Server, ServerOptions } from "socket.io";
import { User } from "../user/user.model";

const markNotificationAsRead = async (notificationId: string, io: ServerOptions) => {
    const result = await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

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

const sendNotificationToAll = async (senderId: string, payload: Omit<INotification, 'receiverId'>, io: Server) => {
    // Step 1: Fetch all user IDs
    const allUsers = await User.find({}, '_id'); // only get _id field of all users
    if (!allUsers.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No users found to send notifications!');
    }

    // Step 2: Prepare bulk notifications
    const notifications = allUsers.map(user => ({
        receiverId: user._id.toString(),
        title: payload.title,
        message: payload.message,
        isRead: user._id.toString() === senderId,
    }));

    // Step 3: Insert notifications in bulk
    const result = await NotificationModel.insertMany(notifications);

    if (!result || result.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to send notifications!');
    }

    // Step 4: Emit notification to all connected clients
    allUsers.forEach(user => {
        io.to(user._id.toString()).emit('NewNotification', {
            title: payload.title,
            message: payload.message,
        });
    });

    return result;
};


const getAllNotificationOfReciver = async (receiverId: string) => {
    const result = await NotificationModel.find({ receiverId: receiverId }).sort("-createdAt");

    const count = await NotificationModel.countDocuments({
        receiverId: receiverId,
        isRead: false,
    });

    return { result, unRead: count };
};

const deleteAllMyNotification = async (userId: string) => {
    const result = await NotificationModel.deleteMany({ receiverId: userId });

    return null;
}


export const NotificationServices = {
    markNotificationAsRead,
    sendNotificationToUser,
    getAllNotificationOfReciver,
    sendNotificationToAll,
    deleteAllMyNotification,
}