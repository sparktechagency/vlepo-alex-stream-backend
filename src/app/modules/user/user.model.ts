import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { IOtpVerification, IUser, UserModal } from './user.interface';
import { USER_ROLE, USER_STATUS } from './user.constants';


// Otp Verification Schema
const otpVerificationSchema = new Schema<IOtpVerification>({
  otp: { type: String, default: "" },
  expireAt: { type: Date, default: new Date() },
  token: { type: String, default: "" },
  isResetPassword: { type: Boolean, default: false }
});

// todo: change userSchema following and follower
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    bio: { type: String, default: "", },
    address: { type: String, default: "" },
    photo: { type: String, default: "https://i.ibb.co/z5YHLV9/profile.png" },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE
    },
    selectedCategory: [{
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: []
    }],
    isVarified: {
      type: Boolean,
      default: false,
    },
    isDeleted: { type: Boolean, default: false },
    otpVerification: { type: otpVerificationSchema, required: false, select: false },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 })
userSchema.index({ _id: 1, isDeleted: 1, status: 1 });



// find user by _id
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id).select("-password");
  
  return isExist;
};


// check user permission for action
// userSchema.statics.isUserPermission = async (id: string) => {
//   const user = await User.findById(id);

//   if (!user) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "User is not found!")
//   }

//   if (user?.isDeleted) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "User is deleted!")
//   }

//   if (user?.status === USER_STATUS.BLOCKED) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "User is blocked!")
//   }

//   return user;
// }

// check user permission for action
userSchema.statics.isUserPermission = async function (id: string) {
  const user = await this.findOne({ _id: id, isDeleted: false, status: { $ne: USER_STATUS.BLOCKED } });

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Permission denied or User not found!');
  }

  return user;
};

// find user by email
userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};


userSchema.pre('save', async function (next) {
  // check already exist user
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);
