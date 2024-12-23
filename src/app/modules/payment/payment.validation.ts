import { z } from "zod";
import { PAYMENT_STATUS } from "./payment.constant";

export const paymentValidationSchema = z.object({
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

export type IPaymentValidation = z.infer<typeof paymentValidationSchema>;
