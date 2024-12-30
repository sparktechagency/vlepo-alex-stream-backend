import { Document, Model, ObjectId } from 'mongoose';
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
  selectedCategory?: ObjectId[];
  isDeleted: boolean;
  otpVerification?: IOtpVerification;
  createdAt?: Date;
  updatedAt?: Date;
  isVarified?: Boolean;
  followersCount?: number;
  eventCount?: number;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isUserPermission(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;

