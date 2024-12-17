import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
// import { emailHelper } from '../../../helpers/emailHelper';
// import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
// import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Event } from '../events/events.model';
import { ObjectId } from 'mongoose';
import { USER_ROLE } from './user.constants';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  if (payload.password !== payload?.confirmPassword) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Your password does't match!")
  }

  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  return createUser;
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

// const updateProfileToDB = async (
//   user: JwtPayload,
//   payload: Partial<IUser>
// ): Promise<Partial<IUser | null>> => {
//   const { id } = user;
//   const isExistUser = await User.isExistUserById(id);
//   if (!isExistUser) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
//   }

//   //unlink file here
//   if (payload.photo) {
//     unlinkFile(isExistUser.photo);
//   }

//   const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
//     new: true,
//   });

//   return updateDoc;
// };

// todo: followers update
// todo: following update
// todo: category update

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
}


//followerId: req.user => who want to follow => req.user
const toggleFollow = async (followerId: ObjectId, userId: ObjectId) => {
  const creator = await User.findById(userId); // jake follow korte chai

  if (!creator) {
    throw new ApiError(StatusCodes.NOT_FOUND, "This person not available!")
  }
  
  if(creator.role === USER_ROLE.USER || creator.role === USER_ROLE.SUPER_ADMIN){
    throw new ApiError(StatusCodes.NOT_FOUND, "You can't follow him!")
  }

  const user = await User.findById(followerId); // je follow korbe

  const isFollowing = user?.followings?.includes(userId);
  const isFollowers = creator?.followers?.includes(followerId);

  const updateFollowingQuery = isFollowing
    ? { $pull: { followings: userId } } // save into the creator 
    : { $addToSet: { followings: userId } }; // save into the creator

  const updateFollowing = await User.findByIdAndUpdate(followerId, updateFollowingQuery, { new: true });

  if(!updateFollowing){
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Something went wrong!")
  }

  const updateFollowersQuery = isFollowers
    ? { $pull: { followers: followerId } } // save into the creator 
    : { $addToSet: { followers: followerId } }; // save into the creator

    await User.findByIdAndUpdate(userId, updateFollowersQuery, { new: true });

  return { followings: updateFollowing?.followings };
}

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  userFavouriteCategoryUpdate,
  savedUserEvents,
  toggleFollow,
  // updateProfileToDB,
};
