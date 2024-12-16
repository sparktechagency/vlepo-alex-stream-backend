import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
// import { emailHelper } from '../../../helpers/emailHelper';
// import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
// import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  if(payload.password !== payload?.confirmPassword){
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

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  // updateProfileToDB,
};
