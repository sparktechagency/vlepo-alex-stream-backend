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
import { AttendanceModel } from "./attendanceSchema";
import { Payment } from "../payment/payment.model";

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
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid event ID.")
    }

    const event = await Event.findById(id)
        .select("createdBy eventName image description eventType ticketPrice startTime")
        .populate("createdBy", "name photo");

    return event;
}


const getSingleSlfEventAnalysisByEventId = async (id: string, timeframe = "6month") => {
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid event ID.");
    }

    const currentDate = new Date();
    let filterDate;

    if (timeframe === "1month") {
        filterDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    } else if (timeframe === "6month") {
        filterDate = new Date(currentDate.setMonth(currentDate.getMonth() - 6));
    } else if (timeframe === "1year") {
        filterDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
    } else {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid timeframe.");
    }


    const event = await Event.findOne({
        _id: id
    })
        .select("eventName image")
        .lean();

    const participants = await AttendanceModel.find({
        eventId: id,
        createdAt: { $gte: filterDate }
    })
        .populate("userId", "name photo ");

    const payment = await Payment.aggregate([
        {
            $match: {
                eventId: new mongoose.Types.ObjectId(id),
                createdAt: { $gte: filterDate }
            }
        },
        {
            $group: {
                _id: "$eventId",
                totalAmount: { $sum: "$amount" },
                ticketSold: { $count: {} }
            }
        }
    ]);


    if (event) {
        event.participants = participants;
    }

    return { event, analysis: payment[0] };
};


const creatorEventOverview = async (creatorId: string) => {

    const events = await Event.aggregate([
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(creatorId),
                // status: EVENTS_STATUS.COMPLETED,
            }
        },
        {
            $group: {
                _id: "$createdBy", // group by creatorId
                totalAmount: { $sum: "$totalSale" },
                doneEvent: {
                    $sum: { $cond: [{ $eq: ["$status", EVENTS_STATUS.COMPLETED] }, 1, 0] }
                },
                upcomingEvent: {
                    $sum: { $cond: [{ $eq: ["$status", EVENTS_STATUS.UPCOMING] }, 1, 0] }
                },
                cancelEvent: {
                    $sum: { $cond: [{ $eq: ["$status", EVENTS_STATUS.CANCELLED] }, 1, 0] }
                },
                liveEvent: {
                    $sum: { $cond: [{ $eq: ["$status", EVENTS_STATUS.LIVE] }, 1, 0] }
                }
            }
        }
    ]);


    return events;
}


// find all the events
const getAllEvents = async (query: Record<string, unknown>) => {
    const events = new QueryBuilder(Event.find({}), query)
        .fields()
        .paginate()
        .sort()
        .filter()
        .search(EventSearchableFields)

    const result = await events.modelQuery
        .populate('categoryId', 'categoryName image')
        .populate("createdBy", "name photo")

    return result;
}


// find all the events which categories is select user
const getMyFavouriteEvents = async (query: Record<string, unknown>, userId: string) => {
    const me = await User.findById(userId).select("selectedCategory");
    
    const events = new QueryBuilder(Event.find({ categoryId: { $in: me?.selectedCategory } }), query)
        .paginate()
        .sort()
        .filter()

    const result = await events.modelQuery
        .populate('categoryId', 'categoryName')
        .populate("createdBy", "name photo")
        .select("eventName image")

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

    if (!event) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Event status does't update.")
    }

    // todo: when is event status will be cancel ticket will be blocked

    return event;
}


const updateAllEventsTrendingStatus = async () => {
    const events = await Event.find()
        .select("isTrending soldSeat views startTime status");

    const bulkOperations = events.map((event) => {
        let isTrending = false;

        if ([EVENTS_STATUS.LIVE, EVENTS_STATUS.CANCELLED, EVENTS_STATUS.COMPLETED].includes(event.status)) {
            isTrending = false;
        } else {

            if (event.views as number > 1000) {
                isTrending = true;
            }

            else if (event.soldTicket as number > 500) {
                isTrending = true;
            }

            else {
                const currentTime = new Date();
                const timeDifference = (event.startTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60); // difference between hour
                if (timeDifference <= 24 && timeDifference > 0) {
                    isTrending = true;
                }
            }
        }

        // MongoDB bulkWrite 
        return {
            updateOne: {
                filter: { _id: event._id },
                update: { $set: { isTrending } },
            },
        };
    });

    // Bulk update 
    await Event.bulkWrite(bulkOperations);

    console.log("Trending status updated for all events");
};



export const eventServices = {
    createEventsIntoDB,
    getSingleEventByEventId,
    getAllEvents,
    getAllEventsOfCreator,
    cancelMyEventById,
    updateAllEventsTrendingStatus,
    getSingleSlfEventAnalysisByEventId,
    creatorEventOverview,
    getMyFavouriteEvents,
}