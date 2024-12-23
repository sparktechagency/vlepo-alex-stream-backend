import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import Category from "../categories/categories.model";
import { IEvent } from "./events.interface";
import { Event } from "./events.model"
import { User } from "../user/user.model";
import { USER_STATUS } from "../user/user.constants";
import { QueryBuilder } from "../../builder/QueryBuilder";
import { EVENTS_STATUS, EventSearchableFields } from "./events.constants";
import mongoose from "mongoose";

const createEventsIntoDB = async (createdBy: string, payload: IEvent) => {
    const { categoryId } = payload;

    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category not available!")
    }

    const user = await User.findById(createdBy);
    if (!user || user.isDeleted || user.status === USER_STATUS.BLOCKED) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User have not permission to create events!")
    }

    const result = await Event.create({ ...payload, createdBy });

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
        .populate('categoryId', 'categoryName image')
        .populate("createdBy", "name photo")
        .populate("attendees")

    return result;
}

const getAllEventsOfCreator = async (query: Record<string, unknown>, creatorId: string) => {
    const events = new QueryBuilder(Event.find({ createdBy: creatorId }), query)
        .fields()
        .paginate()
        .sort()
        .filter()
        .search(EventSearchableFields)

    const result = await events.modelQuery
        .populate('categoryId', 'categoryName image')
        .populate("createdBy", "name photo")
        .populate("attendees")

    return result;
}

const cancelMyEventById = async (eventId: string, creatorId: string) => {
    if (!mongoose.isValidObjectId(eventId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Event ID invalid.")
    }

    const existEvent = await Event.findById(eventId).select("createdBy");

    if (creatorId !== existEvent?.createdBy.toString()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You can not cancel event of another user.")
    }

    const event = await Event.findOneAndUpdate(
        { _id: eventId, createdBy: creatorId },
        { status: EVENTS_STATUS.CANCELLED },
        { new: true }
    );

    if(!event){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Event status does't update.")
    }

    // todo: when is event status will be cancel ticket will be blocked

    return event;
} 



export const eventServices = {
    createEventsIntoDB,
    getSingleEventByEventId,
    getAllEvents,
    getAllEventsOfCreator,
    cancelMyEventById,
    // todo: totalEventsCountOfCreator
}