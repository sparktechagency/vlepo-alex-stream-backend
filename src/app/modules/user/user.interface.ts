import { Model, ObjectId } from 'mongoose';

export interface IOtpVerification extends Document {
  expireAt: Date; 
  otp: string;     
}

export interface IUser extends Document {
  name: string;
  email: string;
  photo?: string;
  password: string;
  role?: USER_ROLE;
  status?: USER_STATUS;
  savedEvents?: ObjectId[];
  eventHistory?: ObjectId[];   
  followers?: ObjectId[];      
  followings?: ObjectId[];     
  isDeleted?: boolean;
  otpVerification?: IOtpVerification;
  createdAt?: Date;
  updatedAt?:Date;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>; 
