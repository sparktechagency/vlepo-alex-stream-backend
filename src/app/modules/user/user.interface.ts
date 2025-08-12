import { Document, Model, ObjectId, Types } from 'mongoose';
import { USER_ROLE, USER_STATUS } from './user.constants';

export interface IOtpVerification {
  expireAt: Date;
  otp: string;
  token: string;
  isResetPassword: boolean;
}

export interface IUser extends Document {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  photo?: string;
  password: string;
  confirmPassword: string;
  role: USER_ROLE;
  status: USER_STATUS;
  selectedCategory?: Types.ObjectId[];
  favoriteEvents?: Types.ObjectId[];
  isDeleted: boolean;
  otpVerification?: IOtpVerification;
  createdAt?: Date;
  updatedAt?: Date;
  isVarified?: Boolean;
  followersCount?: number;
  isFollowed?: boolean;
  eventCount?: number;
  // Stripe Connect fields
  stripeConnectAccountId?: string;
  stripeConnectAccountStatus?: 'pending' | 'active' | 'restricted' | 'inactive';
  stripeOnboardingCompleted?: boolean;
  payoutsEnabled?: boolean;
  chargesEnabled?: boolean;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isUserPermission(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;



export type IUserFilterableFields = {
  searchTerm?: string;
  role?: string;
  status?: string;
}

export type IUserSearchableFields = {
  name?: string;
  email?: string;
  phone?: string;
}