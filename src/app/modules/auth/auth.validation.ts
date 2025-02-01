import { z } from 'zod';

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    oneTimeCode: z.string({ required_error: 'One time code is required' }),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string()
    .email({ message: 'Invalid email format' })
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: 'Password is required' }).min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current Password is required',
    }),
    newPassword: z.string({ required_error: 'New Password is required' }).min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

const resendOtpZodSchema = z.object({
  body: z.object({
    email: z.string()
    .email({ message: 'Invalid email format' })
  })
})


export const AuthValidation = {
  createLoginZodSchema,
  createChangePasswordZodSchema,
  createForgetPasswordZodSchema,
  createVerifyEmailZodSchema,
  createResetPasswordZodSchema,
  refreshTokenValidationSchema,
  resendOtpZodSchema
};
