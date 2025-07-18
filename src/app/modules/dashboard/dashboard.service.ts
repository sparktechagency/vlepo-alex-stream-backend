import { User } from '../user/user.model';
import { USER_ROLE, userSearchableFields } from '../user/user.constants';
import { Event } from '../events/events.model';
import { TicketModel } from '../ticket/tickets.model';
import { EVENTS_STATUS } from '../events/events.constants';
import { Payment } from '../payment/payment.model';
import { IUser, IUserFilterableFields } from '../user/user.interface';
import { IPaginationOptions } from '../../../types/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { SortOrder } from 'mongoose';
import { IPaymentFilterableFields } from '../payment/payment.interface';
import { IEvent } from '../events/events.interface';


const getTotalViewerCountWithGrowthRate = async () => {
  const today = new Date();
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previous30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalViewersAllTimeAggregate,
    totalViewersLast30DaysAggregate,
    totalViewersPrevious30DaysAggregate,
    totalProfitAllTimeAggregate,
    totalProfitLast30DaysAggregate,
    totalProfitPrevious30DaysAggregate,
    totalCreatorsAllTimeAggregate,
    totalCreatorsLast30DaysAggregate,
    totalCreatorsPrevious30DaysAggregate,
  ] = await Promise.all([
    // Total viewers for all time
    Event.aggregate([
      {
        $group: {
          _id: null,
          totalViewers: { $sum: "$views" }, // Use "views" instead of "totalViewers"
        },
      },
    ]),
    // Total viewers for the last 30 days
    Event.aggregate([
      {
        $match: {
          startDate: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: null,
          totalViewers: { $sum: "$views" }, // Use "views" instead of "totalViewers"
        },
      },
    ]),
    // Total viewers for the previous 30 days (days 31–60)
    Event.aggregate([
      {
        $match: {
          startDate: { $gte: previous30Days, $lt: last30Days },
        },
      },
      {
        $group: {
          _id: null,
          totalViewers: { $sum: "$views" }, // Use "views" instead of "totalViewers"
        },
      },
    ]),
    // Total profit for all time
    Event.aggregate([
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$totalSale" },
        },
      },
    ]),
    // Total profit for the last 30 days
    Event.aggregate([
      {
        $match: {
          startDate: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$totalSale" },
        },
      },
    ]),
    // Total profit for the previous 30 days (days 31–60)
    Event.aggregate([
      {
        $match: {
          startDate: { $gte: previous30Days, $lt: last30Days },
        },
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$totalSale" },
        },
      },
    ]),
    // Total creators for all time
    User.aggregate([
      {
        $match: {
          role: USER_ROLE.CREATOR,
        },
      },
      {
        $group: {
          _id: null,
          totalCreators: { $sum: 1 },
        },
      },
    ]),
    // Total creators for the last 30 days
    User.aggregate([
      {
        $match: {
          role: USER_ROLE.CREATOR,
          createdAt: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: null,
          totalCreators: { $sum: 1 },
        },
      },
    ]),
    // Total creators for the previous 30 days (days 31–60)
    User.aggregate([
      {
        $match: {
          role: USER_ROLE.CREATOR,
          createdAt: { $gte: previous30Days, $lt: last30Days },
        },
      },
      {
        $group: {
          _id: null,
          totalCreators: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Extract results or default to 0 if no data is found
  const totalViewersAllTime = totalViewersAllTimeAggregate[0]?.totalViewers || 0;
  const totalViewersLast30Days = totalViewersLast30DaysAggregate[0]?.totalViewers || 0;
  const totalViewersPrevious30Days = totalViewersPrevious30DaysAggregate[0]?.totalViewers || 0;
  const totalProfitAllTime = totalProfitAllTimeAggregate[0]?.totalProfit || 0;
  const totalProfitLast30Days = totalProfitLast30DaysAggregate[0]?.totalProfit || 0;
  const totalProfitPrevious30Days = totalProfitPrevious30DaysAggregate[0]?.totalProfit || 0;
  const totalCreatorsAllTime = totalCreatorsAllTimeAggregate[0]?.totalCreators || 0;
  const totalCreatorsLast30Days = totalCreatorsLast30DaysAggregate[0]?.totalCreators || 0;
  const totalCreatorsPrevious30Days = totalCreatorsPrevious30DaysAggregate[0]?.totalCreators || 0;

  // Calculate growth rates
  const totalViewerGrowthRate =
    totalViewersPrevious30Days === 0
      ? 0
      : ((totalViewersLast30Days - totalViewersPrevious30Days) / totalViewersPrevious30Days) * 100;

  const totalProfitGrowthRate =
    totalProfitPrevious30Days === 0
      ? 0
      : ((totalProfitLast30Days - totalProfitPrevious30Days) / totalProfitPrevious30Days) * 100;

  const totalCreatorsGrowthRate =
    totalCreatorsPrevious30Days === 0
      ? 0
      : ((totalCreatorsLast30Days - totalCreatorsPrevious30Days) / totalCreatorsPrevious30Days) * 100;

  // Calculate total growth rate (average of all growth rates)
  const totalGrowthRate =
    (totalViewerGrowthRate + totalProfitGrowthRate + totalCreatorsGrowthRate) / 3;

  return {
    totalViewers: totalViewersAllTime,
    totalViewerGrowthRate,
    totalProfit: totalProfitAllTime,
    totalProfitGrowthRate,
    totalCreators: totalCreatorsAllTime,
    totalCreatorsGrowthRate,
    totalGrowthRate, // New field for total growth rate
  };
};





export const getUserEngagementData = async (year?: string) => {
  const now = new Date();
  const currentYear = year || now.getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  return await Promise.all(
    months.map(async (month, index) => {
      const startDate = new Date(Date.UTC(Number(currentYear), index, 1));
      const endDate = new Date(Date.UTC(Number(currentYear), index + 1, 0, 23, 59, 59));



      const events = await Event.find({
        createdAt: { $gte: startDate, $lte: endDate },
        createdBy: { $ne: null },
      });

      const ticketCount = await TicketModel.countDocuments({
        eventId: { $in: events.map((event) => event._id) },
      });

      const eventCreateCount = await Event.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        createdBy: { $ne: null },
      });

      return {
        month,
        ticketCount,
        eventCreateCount,
      };
    })
  );
};

export const getViewsAndCreatorCount = async (year?: string) => {
  const now = new Date();
  const currentYear = year || now.getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  return await Promise.all(
    months.map(async (month, index) => {
      const startDate = new Date(Date.UTC(Number(currentYear), index, 1));
      const endDate = new Date(Date.UTC(Number(currentYear), index + 1, 0, 23, 59, 59));



      const viewsCount = await Event.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
          },
        },
      ]);

      const creatorCount = await User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        role: USER_ROLE.CREATOR,
      });



      return {
        month,
        viewsCount: viewsCount[0]?.totalViews || 0,
        creatorCount,
      };
    })
  );
};

const getEventStat = async (year?: string) => {
  const now = new Date();
  const currentYear = year || now.getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  const monthlyStats = await Promise.all(
    months.map(async (month, index) => {
      const startDate = new Date(Date.UTC(Number(currentYear), index, 1));
      const endDate = new Date(Date.UTC(Number(currentYear), index + 1, 0, 23, 59, 59));



      const totalEventAmount = await Event.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalSale" },
          },
        },
      ]);



      return {
        month,
        totalEventAmount: totalEventAmount[0]?.totalAmount || 0,
      };
    })
  );

  const totalEvents = await Event.countDocuments({});
  const totalUpcomingEvents = await Event.countDocuments({ status: EVENTS_STATUS.UPCOMING });
  const totalTicketsSold = await Event.aggregate([
    {
      $group: {
        _id: null,
        totalSold: { $sum: "$soldTicket" },
      },
    },
  ]);

  return {
    monthlyStats,
    totalEvents,
    totalUpcomingEvents,
    totalTicketsSold: totalTicketsSold[0]?.totalSold || 0,
  };
};


const getAllEvents = async () => {
  return Event.find({}, {
    eventName: 1,
    totalSale: 1,
    views: 1,
    totalSeat: 1,
    soldTicket: 1,
    status: 1,
    startTime: 1,
    endTime: 1
  });
}

const getAllPurchaseHistory = async (filters: IPaymentFilterableFields, pagination: IPaginationOptions) => {
  const { skip, sortBy, sortOrder, page, limit } = paginationHelper.calculatePagination(pagination);
  const { searchTerm, paymentStatus } = filters;

  const andConditions = [];

  // Filter by payment status
  if (paymentStatus) {
    andConditions.push({ paymentStatus: paymentStatus });
  }

  // Sorting conditions
  const sortConditions: { [key: string]: 1 | -1 } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1; // Ensure sortOrder is in correct format
  }

  // Build the where condition
  const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};

  // Query the database and populate fields
  let result = await Payment.find(whereCondition)
    .populate<{userId:Partial<IUser>}>({
      path: 'userId',
      select: 'name email'
    })
    .populate<{eventId:Partial<IEvent>}>({
      path: 'eventId',
      select: 'eventName image ticketPrice startTime endTime' // Adjust the fields you want
    })
    .lean()  // This will convert the Mongoose documents to plain objects
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  // Apply search term filtering after population
  if (searchTerm) {
    result = result.filter(payment => {
      const eventNameMatch = payment!.eventId!.eventName!.toLowerCase().includes(searchTerm.toLowerCase());
      const userNameMatch = payment!.userId!.name!.toLowerCase().includes(searchTerm.toLowerCase());
      return eventNameMatch || userNameMatch;
    });
  }

  // Count total documents
  const total = await Payment.countDocuments(whereCondition);

  // Return paginated data
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result, // The data is now a plain object without circular references
  };
};


const getAllUsers = async (filters:IUserFilterableFields, pagination:IPaginationOptions) => {

  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);
  const {searchTerm, ...filtersData} = filters;

  const andConditions = [];
  if(searchTerm) {
    andConditions.push({
      $or:
        userSearchableFields.map((field) => ({
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        })),

    })
  }

    if(Object.keys(filtersData).length){
      andConditions.push({
        $and: Object.entries(filtersData).map(([field,value]) => ({
          [field]: value,
        })),
      });
    }

    const sortConditions:{[key:string]:SortOrder} = {};
    if(sortBy && sortOrder){
      sortConditions[sortBy] = sortOrder;
    }


    const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};


    const result = await User.find(whereCondition).sort(sortConditions).skip(skip).limit(limit);
    const total = await User.countDocuments(whereCondition);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: result,

    }

}

export const DashboardService = {
  getTotalViewerCountWithGrowthRate,
  getUserEngagementData,
  getViewsAndCreatorCount,
  getEventStat,
  getAllEvents,
  getAllPurchaseHistory,
  getAllUsers,

};