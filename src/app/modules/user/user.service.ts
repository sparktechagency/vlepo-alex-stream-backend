import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Event } from '../events/events.model';
import { USER_ROLE, USER_STATUS } from './user.constants';
import unlinkFile from '../../../shared/unlinkFile';
import { Follow } from '../follow/follow.model';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import generateOTP from '../../../util/generateOTP';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { IVerifyEmail } from '../auth/atuh.interface';
import { Types } from 'mongoose';
import { EVENTS_STATUS } from '../events/events.constants';
import { Payment } from '../payment/payment.model';
import { PAYMENT_STATUS } from '../payment/payment.constant';
import { logger } from '../../../shared/logger';

/**
 * create and verify email
 * => create user
 *  = send OTP on user mail
 * => login user
 *  = if you want to full access than need to email verify
 *  = in verify page give the OTP for verified
 */

const createUserToDB = async (payload: Partial<IUser>): Promise<null> => {
  if (payload.password !== payload?.confirmPassword) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Your password does't match!");
  }

  const isEmailExit = await User.findOne({ email: payload.email, isDeleted: false });
  console.log(isEmailExit, 'isEmailExit');

  if (isEmailExit) {
    console.log(isEmailExit, '---isEmailExit');
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist');
  }

  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  // send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: createUser.email,
  };

  const registerEmailTem = emailTemplate.registerAccountOtpSend(value);

  emailHelper.sendEmail(registerEmailTem);

  //save to DB
  await User.findOneAndUpdate(
    { email: createUser.email },
    {
      $set: {
        'otpVerification.otp': otp,
        'otpVerification.expireAt': Date.now() + 10 * 60 * 1000,
      },
    }
  );

  return null;
};

//verify email
// const verifyRegisterEmail = async (email: string, otp: string) => {
//   if (!otp) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'OTP needed! Please check your email we send a code!'
//     );
//   }

//   const isExistUser = await User.findOne({ email }).select('+otpVerification');

//   if (isExistUser?.isVarified) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'You are already verified!');
//   }

//   if (!isExistUser) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
//   }

//   if (isExistUser.status === USER_STATUS.BLOCKED) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'User are bloocked!');
//   }

//   if (isExistUser.isDeleted) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'User is deleted!');
//   }

//   if (isExistUser?.otpVerification?.otp !== otp) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
//   }

//   const result = await User.findByIdAndUpdate(
//     isExistUser._id,
//     {
//       isVarified: true,
//       otpVerification: {
//         otp: '',
//       },
//     },
//     { new: true }
//   );

//   return result;
// };

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id, role } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  let followersCount = 0;
  let eventCount = 0;

  if (role === USER_ROLE.CREATOR) {
const [followersCount, eventCount] = await Promise.all([
  Follow.countDocuments({ followingId: id }),
  Event.countDocuments({ createdBy: id }),
])
    let user = isExistUser.toObject();

    // Add the new properties
    user.followersCount = followersCount;
    user.eventCount = eventCount;

    return user;
  }

  if (role === USER_ROLE.USER) {

    const followingCount = await Follow.countDocuments({ followingId: id });
    const totalEvents = isExistUser.favoriteEvents?.length || 0;

    let user = isExistUser.toObject();

    // Add the new properties
    user.followingCount = followingCount;
    user.eventCount = totalEvents;

    return user;
  }

  return isExistUser;
};

const getCreatorProfileFromDB = async (user:JwtPayload,creatorId: string) => {
  const isExistUser = await User.findById(creatorId).select(
    'name bio description photo role'
  );

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // if params is userId data does not retrived
  if (isExistUser.role === USER_ROLE.USER) {
    return null;
  }

  let followersCount = await Follow.countDocuments({ followingId: creatorId });
  let eventCount = await Event.countDocuments({ createdBy: creatorId });

  let existingUser = isExistUser.toObject();

  //make sure if the requested user follow the creator return isFollowed true else false
  const isFollowed = await Follow.findOne({ userId: user.id, followingId: creatorId });

  // Add the new properties
  existingUser.followersCount = followersCount;
  existingUser.eventCount = eventCount;
  existingUser.isFollowed = isFollowed ? true : false;

  return existingUser;
};

// selectedCategory update
const userFavoriteCategoryUpdate = async (id: string, categoryId: string) => {
  const result = await User.findByIdAndUpdate(
    id,
    {
      $addToSet: { selectedCategory: categoryId },
    },
    { new: true }
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  return result;
};

const deleteCurrentUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });

  return null;
};

const updateMyProfile = async (id: string, payload: Partial<IUser>) => {
  const isExistUser = await User.isUserPermission(id);

  console.log(payload,"profile update payload");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (payload.email) {
    if (!emailRegex.test(payload.email)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid email format.');
    }
  }

  //unlink file here
  if (payload.photo) {
    unlinkFile(isExistUser?.photo);
  }

  const result = await User.findOneAndUpdate(
    {
      _id: id, // Match by ID
      isDeleted: false, // User should not be deleted
      status: { $ne: USER_STATUS.BLOCKED }, // User should not be blocked
    },
    payload, // Update payload
    { new: true } // Return updated document
  );

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Permission denied or user not found!'
    );
  }

  return result;
};

const updateUserStatus = async (id: string, payload: Partial<IUser>) => {
  const result = await User.findByIdAndUpdate(id, payload, { new: true });

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Permission denied or user not found!'
    );
  }

  return result;
};

const toggleUserRole = async (user: JwtPayload, payload: Partial<IUser>) => {
  const { id: userId, role } = user;

  if (role === payload.role) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You already logedin as a ${payload.role}`
    );
  }

  await User.isUserPermission(userId);

  const result = await User.findByIdAndUpdate(userId, payload, { new: true });

  if (!result) {
    throw new ApiError(StatusCodes.FORBIDDEN, "User can't switch his role.");
  }

  //create token
  const accessToken = jwtHelper.createToken(
    { id: result._id, role: result.role, email: result.email },
    config.jwt.jwt_secret as string,
    config.jwt.jwt_expire_in as string
  );

  const refreshToken = jwtHelper.createToken(
    { id: result._id, role: result.role, email: result.email },
    config.jwt.jwt_refresh as string,
    config.jwt.jwt_refresh_expire_in as string
  );

  return { accessToken, refreshToken, result };
};

const bestSellerCreators = async () => {
  const bestSeller = await Event.aggregate([
    {
      $group: {
        _id: '$createdBy',
        totalTicketSold: { $sum: '$soldTicket' },
        totalRevenue: { $sum: '$totalSale' },
      },
    },
    {
      $sort: { totalTicketSold: -1 },
    },
    {
      $limit: 4,
    },
    {
      $lookup: {
        from: 'users', // 'users' কালেকশন যেখানে ক্রিয়েটরদের তথ্য রয়েছে
        localField: '_id', // এই আইডি গ্রুপিংয়ের _id হিসেবে এসেছে
        foreignField: '_id', // users কালেকশনে _id ফিল্ডের সাথে মেলানো হবে
        as: 'creatorInfo', // পপুলেট হওয়া ডেটার জন্য নতুন ফিল্ড
      },
    },
    {
      $unwind: '$creatorInfo', // পপুলেট হওয়া তথ্য আনর‍্যাপ করার জন্য
    },
    {
      $project: {
        _id: 1,
        totalTicketSold: 1,
        totalRevenue: 1,
        'creatorInfo.photo': 1,
        'creatorInfo.name': 1,
      },
    },
  ]);

  return bestSeller;
};



const favoritesEvent = async (user: JwtPayload, id: Types.ObjectId) => {

    // Check if the event is already in the user's favorites
    const userDoc = await User.findById(user);
    if (!userDoc) {
      throw new Error("User not found");
    }

    const isFavorite = userDoc!.favoriteEvents!.includes(id);

    // Use $pull to remove or $addToSet to add the event
    const updateOperation = isFavorite
      ? { $pull: { favoriteEvents: id } }
      : { $addToSet: { favoriteEvents: id } };

    const result = await User.findByIdAndUpdate(user, updateOperation, { new: true });

    return isFavorite
      ? "Removed from favorites"
      : "Added to favorites";
  
};

const getUserFavoriteEvents = async (user: JwtPayload) => {
  console.log(user)
  const userDoc = await User.findById(user.id, { favoriteEvents: 1, name: 1, profilePhoto: 1 }).populate('favoriteEvents');
  if (!userDoc) {
    throw new Error("User not found");
  }


    return userDoc;
}


const getCreatorTotalSalesAndRecentEvents = async (user: JwtPayload) => {

  const userDoc = await User.findOne({ _id: user.id });

  if (!userDoc) {
    throw new Error("User not found");
  }

  // Query Payment collection and join with Event collection to get total earnings for the creator
  const totalEarning = await Payment.aggregate([
    {
      $lookup: {
        from: "events", // Event collection name in MongoDB
        localField: "eventId", // Reference field in Payment collection
        foreignField: "_id", // Field in Event collection
        as: "event",
      },
    },
    {
      $unwind: "$event", // Unwind the array from the lookup to access event details
    },
    {
      $match: {
        "event.createdBy": new Types.ObjectId(user.id), // Ensure the event is created by the user
        paymentStatus: PAYMENT_STATUS.PAID, // Only consider paid payments
      },
    },
    {
      $group: {
        _id: null,
        totalEarning: { $sum: "$amount" }, // Sum the payment amounts
      },
    },
  ]).then((result) => result[0]?.totalEarning || 0);

  // Query Event collection for recent events
  const recentEvents = await Event.find({
    createdBy: user.id,
    status: { $nin: [EVENTS_STATUS.COMPLETED, EVENTS_STATUS.CANCELLED] },
    startDate: { $gt: new Date() },
  }).sort({ startDate: -1 });

  return { totalEarning, recentEvents };
};




const getUserByUserId = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId,{name: 1, profilePhoto: 1, email: 1, phone: 1, photo: 1});
  if (!user) {
    throw new Error("User not found");
  }


  //get user followers
  const followingCount = await Follow.countDocuments({ followingId: userId });

  return {...user.toObject(), followingCount};
}


const restrictOrUnrestrictUser = async (id: Types.ObjectId) => {

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }
  if (user.status === USER_STATUS.BLOCKED) {
    await User.findByIdAndUpdate(
      id,
      { $set: { status: USER_STATUS.ACTIVE } },
      {
        new: true,
      },
    )
    return `${user?.name} is un-restricted`;
  }
  const result = await User.findByIdAndUpdate(
    id,
    { $set: { status: USER_STATUS.BLOCKED } },
    {
      new: true,
    },
  );


  return `${result?.name} is restricted`;
};

const createAdmin = async (): Promise<Partial<IUser> | null> => {
  const admin = {
    email: config.admin.email,
    name: "ALEX",
    password: config.admin.password,
    role: USER_ROLE.SUPER_ADMIN,
    status: USER_STATUS.ACTIVE,
    verified: true,
    
  }

  const isAdminExist = await User.findOne({
    email: admin.email,
    role: USER_ROLE.SUPER_ADMIN,
    status: { $nin: [USER_STATUS.BLOCKED] },
  })

  if (isAdminExist) {
    logger.log('info', 'Admin account already exist, skipping creation.🦥')
    return isAdminExist
  }
  const result = await User.create([admin])
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin')
  }
  return result[0]
}

export const UserService = {
  createUserToDB,
  // verifyRegisterEmail,
  getUserProfileFromDB,
  userFavoriteCategoryUpdate,
  deleteCurrentUser,
  updateMyProfile,
  updateUserStatus,
  getCreatorProfileFromDB,
  toggleUserRole,
  bestSellerCreators,
  favoritesEvent,
  getUserFavoriteEvents,
  getCreatorTotalSalesAndRecentEvents,
  getUserByUserId,
  restrictOrUnrestrictUser,
  createAdmin
};
