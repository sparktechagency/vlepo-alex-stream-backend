import { z } from 'zod';
import { USER_ROLE, USER_STATUS } from './user.constants';

const otpVerificationSchema = z.object({
  otp: z.string().nullable(),
  expireAt: z.date().nullable(),
});

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"), // Name must be a non-empty string
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    photo: z.string().url().optional().default("https://i.ibb.co/z5YHLV9/profile.png"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum([USER_ROLE.SUPER_ADMIN, USER_ROLE.USER, USER_ROLE.CREATOR]).default(USER_ROLE.USER),
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.BLOCKED]).default(USER_STATUS.ACTIVE),
    savedEvents: z.array(z.string().uuid()).default([]),
    eventHistory: z.array(z.string().uuid()).default([]),
    followers: z.array(z.string().uuid()).default([]),
    followings: z.array(z.string().uuid()).default([]),
    isDeleted: z.boolean().default(false),
    otpVerification: otpVerificationSchema.optional(),
  })
});


export const UserValidation = {
  createUserZodSchema,
};
