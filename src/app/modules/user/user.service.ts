import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Event } from '../events/events.model';
import { USER_ROLE, USER_STATUS } from './user.constants';
import unlinkFile from '../../../shared/unlinkFile';
import { Follow } from '../follow/follow.model';
import { number } from 'zod';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';

const createUserToDB = async (payload: Partial<IUser>): Promise<null> => {
  if (payload.password !== payload?.confirmPassword) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Your password does't match!")
  }

  const isEmailExit = await User.findOne({ email: payload.email });
  if (isEmailExit) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exist")
  }

  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  return null;
};

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
    followersCount = await Follow.countDocuments({ followingId: id });
    eventCount = await Event.countDocuments({ createdBy: id });
    let user = isExistUser.toObject();

    // Add the new properties
    user.followersCount = followersCount;
    user.eventCount = eventCount;


    return user;
  }

  return isExistUser;
};

const getCreatorProfileFromDB = async (creatorId: string) => {
  const isExistUser = await User.findById(creatorId)
    .select("name bio description photo role");

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // if params is userId data does not retrived
  if (isExistUser.role === USER_ROLE.USER) {
    return null;
  }

  let followersCount = await Follow.countDocuments({ followingId: creatorId });
  let eventCount = await Event.countDocuments({ createdBy: creatorId });



  let user = isExistUser.toObject();

  // Add the new properties
  user.followersCount = followersCount;
  user.eventCount = eventCount;

  return user;
};


// selectedCategory update
const userFavouriteCategoryUpdate = async (id: string, categoryId: string) => {
  const result = await User.findByIdAndUpdate(
    id,
    {
      $addToSet: { selectedCategory: categoryId }
    },
    { new: true }
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  return result;
}

const deleteCurrentUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId,
    { isDeleted: true },
    { new: true }
  );

  return null;
}


const updateMyProfile = async (id: string, payload: Partial<IUser>) => {
  const isExistUser = await User.isUserPermission(id);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (payload.email) {
    if (!emailRegex.test(payload.email)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid email format.")
    }
  }

  //unlink file here
  if (payload.photo) {
    unlinkFile(isExistUser?.photo);
  }

  const result = await User.findOneAndUpdate(
    {
      _id: id,                      // Match by ID
      isDeleted: false,             // User should not be deleted
      status: { $ne: USER_STATUS.BLOCKED }, // User should not be blocked
    },
    payload,                        // Update payload
    { new: true }                // Return updated document
  );

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Permission denied or user not found!");
  }

  return result;
};


const updateUserStatus = async (id: string, payload: Partial<IUser>) => {

  const result = await User.findByIdAndUpdate(id,
    payload,
    { new: true }
  );

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Permission denied or user not found!");
  }

  return result;
};

const toggleUserRole = async (user: JwtPayload, payload: Partial<IUser>) => {
  const { id: userId, role } = user;

  if (role === payload.role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `You already logedin as a ${payload.role}`);
  }

  await User.isUserPermission(userId);

  const result = await User.findByIdAndUpdate(userId, payload, { new: true });

  if (!result) {
    throw new ApiError(StatusCodes.FORBIDDEN, "User can't switch his role.")
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
}


export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  userFavouriteCategoryUpdate,
  deleteCurrentUser,
  updateMyProfile,
  updateUserStatus,
  getCreatorProfileFromDB,
  toggleUserRole,
};
