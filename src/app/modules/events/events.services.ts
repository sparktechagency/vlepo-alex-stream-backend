import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import Category from '../categories/categories.model';
import { IEvent, IEventFilters } from './events.interface';
import { Event } from './events.model';
import { User } from '../user/user.model';
import { USER_STATUS } from '../user/user.constants';
import { QueryBuilder } from '../../builder/QueryBuilder';
import { EVENTS_STATUS, EventSearchableFields } from './events.constants';
import mongoose, { Types } from 'mongoose';
import { AttendanceModel } from './attendanceSchema';
import { Payment } from '../payment/payment.model';
import { JwtPayload } from 'jsonwebtoken';
import { Follow } from '../follow/follow.model';

const createEventsIntoDB = async (createdBy: string, payload: IEvent) => {
    const { categoryId, ticketPrice, totalSeat } = payload;

    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category not available!")
    }

    const user = await User.findById(createdBy);
    if (!user || user.isDeleted || user.status === USER_STATUS.BLOCKED) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User have not permission to create events!")
    }

    payload.ticketPrice = Number(ticketPrice);
    payload.totalSeat = Number(totalSeat);
    payload.createdBy = new Types.ObjectId(createdBy);
    const result = await Event.create({ ...payload});

    return result;
}

const getSingleEventByEventId = async (user: JwtPayload, id: string) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid event ID.")
    }

    const event = await Event.findById(id)
        .select("createdBy eventName image description eventType ticketPrice startTime soldTicket totalSale")
        .populate("createdBy", "name photo");

        if(!event) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Event not found!")
        }
    //check if the event is favorites by the user and also the creator of the event is followed by the user or not based on that add two flag when returning the event
 
     const [existingUser, following] = await Promise.all([
         User.findById(user.id),
         Follow.findOne({userId:user.id, followingId:event.createdBy})
        ]);
        
        if(!existingUser) {
           throw new ApiError(StatusCodes.NOT_FOUND, "User not found!")
        }
        if(!following) {
            event.isFollowing = false;
        }else {
            event.isFollowing = true;
        }
        const isFavorite = existingUser?.favoriteEvents?.includes(new Types.ObjectId(id));
        event.isFavorite = isFavorite;
        const isFollowing = event.isFollowing;

    //add is ticket booked flag from payment collection
    const eventIds = await Payment.find({userId:user.id}).distinct("eventId");
    const bookedEvents = eventIds?.map(event => event.toString());

        return {...event.toObject(), isFavorite, isFollowing, isTicketBooked:bookedEvents.includes(id)};

    
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

    // ✅ Fetch event and populate participants directly
    const event = await Event.findOne({ _id: id })
      .select("eventName image soldTicket totalSale startTime endTime participants ")
      .populate("participants", "name photo") // ✅ Populate participants
      .lean();

    if (!event) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
    }

    // ✅ Aggregate Payment Data
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
                ticketSold: { $count: {} },
                transactionIds: { $push: "$transactionId" } // Collect all transaction IDs
            }
        }
    ]);


    return { event, analysis: payment[0] || {} };
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
const getAllEvents = async (user: JwtPayload,  query: Record<string, unknown>) => {
    const isExistUser = await User.findById(user.id).select("favoriteEvents");

    if (!isExistUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    const favoriteEvents = isExistUser?.favoriteEvents?.map(event => event.toString()); // Convert to string for comparison


    const events = new QueryBuilder(Event.find({}), query)
        .fields()
        .paginate()
        .sort()
        .filter()
        .search(EventSearchableFields);


    const result = await events.modelQuery
        .populate('categoryId', 'categoryName image')
        .populate("createdBy", "name photo");

    //add is ticket booked flag from payment collection
    const eventIds = await Payment.find({userId:user.id}).distinct("eventId");
    const bookedEvents = eventIds?.map(event => event.toString());



    // Add `isFavorite` flag
    return result.map((event: Record<string, any>) => ({
        ...event.toObject(), // Convert Mongoose document to plain object
        isFavorite: favoriteEvents?.includes(event._id.toString()), // Check if event is in user's favorite list
        isTicketBooked: bookedEvents?.includes(event._id.toString())
    }));
};





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


};


const updateEvent= async (id: Types.ObjectId, payload: Partial<IEvent>) => {

    const event = await Event.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true }
    );


    if (!event) {   
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update event!");
    }

    return event;
}


const getFollowingUserEvents = async (userId: Types.ObjectId, filters: IEventFilters) => {
    const { searchTerm, ...EventFilterableFields } = filters;
    // Step 1: Retrieve the user's favorite events
    const user = await mongoose.model('User').findById(userId).select('favoriteEvents');
    if (!user) {
      throw new Error('User not found');
    }

    const favoriteEventIds = user.favoriteEvents;

    const andConditions = [];

    // Step 2: Build the query for favorite events
    andConditions.push({ _id: { $in: favoriteEventIds } });
    // Step 3: Apply search term if provided
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      const searchQuery = {
        $or: EventSearchableFields.map(field => ({
          [field]: searchRegex
        }))
      };
      andConditions.push(searchQuery);
    }
  
    // Step 4: Apply filters if provided
    if (Object.keys(EventFilterableFields).length > 0) {
      andConditions.push({
        $and: Object.entries(EventFilterableFields).map(([key, value]) => ({
          [key]: value
        }))
      });
    }
     
    

    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};

    const [upcomingEvents, completedEvents] = await Promise.all([
      Event.countDocuments({ _id: { $in: favoriteEventIds }, status: EVENTS_STATUS.UPCOMING }),
      Event.countDocuments({ _id: { $in: favoriteEventIds }, status: EVENTS_STATUS.COMPLETED })
    ]);

    const result = await Event.find(whereConditions).populate({path:'createdBy',select:{name:1,photo:1}});


    return {stat:{upcomingEvent:upcomingEvents, completedEvents:completedEvents}, result:result}
    

}

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
    updateEvent,
    getFollowingUserEvents

}