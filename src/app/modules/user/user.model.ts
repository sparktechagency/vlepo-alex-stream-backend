import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { IOtpVerification, IUser, UserModal } from './user.interface';


// Otp Verification Schema
const otpVerificationSchema = new Schema<IOtpVerification>({
  otp: { type: String, default: null },
  expireAt: { type: Date, default: null },
});


const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
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
    savedEvents: [{
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: []
    }],
    eventHistory: [{
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: []
    }],
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    followings: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    isDeleted: { type: Boolean, default: false },
    otpVerification: { type: otpVerificationSchema, required: false },
  },
  { timestamps: true }
);



// find user by _id
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
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
  console.log("\nuser model this check:", this);
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
