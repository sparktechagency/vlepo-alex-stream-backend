import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import Category from "../categories/categories.model";
import { IEvent } from "./events.interface";
import { Event } from "./events.model"
import { User } from "../user/user.model";
import { USER_STATUS } from "../user/user.constants";
import { QueryBuilder } from "../../builder/QueryBuilder";
import { EventSearchableFields } from "./events.constants";

const createEventsIntoDB = async (payload: IEvent) => {
    const { userId, categoryId } = payload;
    // todo: upload image

    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category not available!")
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted || user.status === USER_STATUS.BLOCKED) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User have not permission to create events!")
    }

    const result = await Event.create(payload);

    return result;
}

const getSingleEventByEventId = async (id: string) => {
    const event = await Event.findById(id);
    return event;
}


const getAllEvents = async (query: Record<string, unknown>) => {
    const events = new QueryBuilder(Event.find(), query)
        .fields()
        .paginate()
        .sort()
        .filter()
        .search(EventSearchableFields)

    const result = await events.modelQuery
        .populate('categoryId')
        .populate("userId")
        .populate("attendees")

    return result;
}

const getAllEventsOfCreator = async (query: Record<string, unknown>, creatorId: string) => {
    console.log({creatorId});
    const events = new QueryBuilder(Event.find({ userId: creatorId }), query)
        .fields()
        .paginate()
        .sort()
        .filter()
        .search(EventSearchableFields)

    const result = await events.modelQuery
        // .populate('categoryId')
        .populate("userId")
        .populate("attendees")

    return result;
}

const findSaveEvent = async (userId: string) => {
    const user = await User.findById(userId);

    console.log(user?.savedEvents);
    const savedEvents = await Event.find(
        { _id: { $in: user?.savedEvents } }
    )

    return savedEvents;
}




export const eventServices = {
    createEventsIntoDB,
    getSingleEventByEventId,
    getAllEvents,
    getAllEventsOfCreator,
    findSaveEvent,
}