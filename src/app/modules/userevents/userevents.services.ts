import ApiError from "../../../errors/ApiError";
import { QueryBuilder } from "../../builder/QueryBuilder";
import { User } from "../user/user.model";
import { IUserEvent } from "./userevents.interface";
import { UserEvent } from "./userevents.model";

const createUserEventIntoDB = async (id: string, payload: Partial<IUserEvent>) => {
    const user = await User.isUserPermission(id);
    const result = await UserEvent.create(
        { ...payload, userId: user._id }
    )
    return result;
};

const getEventsFilterByType = async (id: string, query: Record<string, unknown>) => {

    const userEvents = new QueryBuilder(UserEvent.find(
        { userId: id, query: query?.type }
    ), query)
        .paginate()
        .filter()

    const result = await userEvents.modelQuery
        .populate('eventId', 'eventName image startTime soldSeat')

    return result;

};


export const UserEventServices = {
    createUserEventIntoDB,
    getEventsFilterByType
};
