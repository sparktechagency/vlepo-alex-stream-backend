import { z } from "zod";
import { PAYMENT_STATUS } from "./payment.constant";

export const createPaymentValidationSchema = z.object({
  userId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId for userId"),
  eventId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId for eventId"),
  transactionId: z
    .string()
    .min(1, "Transaction ID is required"),
  amount: z
    .number(),
  paymentStatus: z.enum(Object.values(PAYMENT_STATUS) as [string, ...string[]]).optional(),
  paymentMethod: z
    .string()
    .min(3, "Payment method must be at least 3 characters long")
    .max(50, "Payment method should not exceed 50 characters"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


const isValidObjectId = (value: string) => /^[a-fA-F0-9]{24}$/.test(value);

const paymentIntentSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: "Amount is required" })
      .positive("Amount must be a positive number"),
    eventId: z
      .string({ required_error: "Event ID is required" })
      .refine(isValidObjectId, {
        message: "Event ID must be a valid ObjectId",
      }),
    userId: z
      .string({ required_error: "User ID is required" })
      .refine(isValidObjectId, {
        message: "User ID must be a valid ObjectId",
      }),
  })
});

const paymentIntentIdValidation = z.object({
  body: z.object({
    paymentIntentId: z
      .string({ required_error: "User ID is required" })
  })
});

export const paymentValidationSchema = {
  paymentIntentSchema,
  createPaymentValidationSchema,
  paymentIntentIdValidation,
}      
