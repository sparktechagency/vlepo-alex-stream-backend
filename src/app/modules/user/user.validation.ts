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
    selectedCategory: z.array(z.string().uuid()).default([]),
    isDeleted: z.boolean().default(false),
    isVarified: z.boolean().default(false),
    otpVerification: otpVerificationSchema.optional(),
  })
});

const verifyRegisterEmailZodSchema = z.object({
  body: z.object({
    otp: z.string().min(6, "OTP min 6 digit").max(6, "OTP max digit 6"),
  })
})

const updateFavouriteCategoryZodSchema = z.object({
  body: z.object({
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
      message: "Accepted ObjectId format only!"
    }),
  })
})

const userChangeStatusZodSchema = z.object({
  body: z.object({
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.BLOCKED], { required_error: `Value will be ${USER_STATUS.ACTIVE} or ${USER_STATUS.BLOCKED}` })
  })
})


const userRoleChangeZodSchema = z.object({
  body: z.object({
    role: z.enum([USER_ROLE.USER, USER_ROLE.CREATOR])
  })
});



export const UserValidation = {
  createUserZodSchema,
  verifyRegisterEmailZodSchema,
  updateFavouriteCategoryZodSchema,
  userChangeStatusZodSchema,
  userRoleChangeZodSchema,
  // updateProfileZodSchema,
};
