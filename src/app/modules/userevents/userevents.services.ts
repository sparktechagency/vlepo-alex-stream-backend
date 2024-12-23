import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { QueryBuilder } from "../../builder/QueryBuilder";
import { User } from "../user/user.model";
import { IUserEvent } from "./userevents.interface";
import { UserEvent } from "./userevents.model";
import mongoose from "mongoose";
import { Event } from "../events/events.model";

const createUserEventIntoDB = async (id: string, payload: Partial<IUserEvent>) => {
    const user = await User.isUserPermission(id);

    const existEvent = await Event.findById(payload.eventId);
    if (!existEvent) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Event not found!")
    }

    const result = await UserEvent.create(
        { ...payload, userId: user._id }
    );
    return result;
};

const getEventsFilterByType = async (id: string, query: Record<string, unknown>) => {
    const userEvents = new QueryBuilder(UserEvent.find(
        { userId: id}
    ), query)
        .paginate()
        .filter()

    const result = await userEvents.modelQuery
        .populate('eventId', 'eventName image startTime soldSeat')

    return result;

};

const deleteUserEvent = async (userEventId: string) => {
    if (!mongoose.isValidObjectId(userEventId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Event id is not valid!")
    }

    const result = await UserEvent.findByIdAndDelete(userEventId);
    
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User event not found!")
    }

    return null;
}


export const UserEventServices = {
    createUserEventIntoDB,
    getEventsFilterByType,
    deleteUserEvent,
};
