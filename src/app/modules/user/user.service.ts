import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Event } from '../events/events.model';
import { QueryBuilder } from '../../builder/QueryBuilder';
import { USER_STATUS } from './user.constants';
import unlinkFile from '../../../shared/unlinkFile';

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
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
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

const savedUserEvents = async (userId: string, eventId: string) => {
  const isUser = await User.findById(userId);
  if (!isUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  const isEvent = await Event.findById(eventId);
  if (!isEvent) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found!");
  }

  const result = await User.findByIdAndUpdate(userId,
    {
      $addToSet: { savedEvents: eventId }
    },
    { new: true }
  );

  return { savedEvents: result?.savedEvents };
};

const deleteCurrentUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId,
    { isDeleted: true },
    { new: true }
  );

  return null;
}

// todo: add profile photo upload functionality
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




export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  userFavouriteCategoryUpdate,
  savedUserEvents,
  deleteCurrentUser,
  updateMyProfile,
};
