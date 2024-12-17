import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import Category from "../categories/categories.model";
import { IEvent } from "./events.interface";
import { Event } from "./events.model"
import { User } from "../user/user.model";
import { USER_STATUS } from "../user/user.constants";

const createEventsIntoDB = async (payload: IEvent) => {
    const { userId, categoryId } = payload;

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




export const eventServices = {
    createEventsIntoDB,
    getSingleEventByEventId,
}