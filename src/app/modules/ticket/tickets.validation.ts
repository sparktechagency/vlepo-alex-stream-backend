import { z } from "zod";

export const TicketValidationSchema = z.object({
    _id: z.string().refine((id) => /^[a-f\d]{24}$/i.test(id), {
      message: "Invalid ObjectId format for _id",
    }),
    eventId: z.string().refine((id) => /^[a-f\d]{24}$/i.test(id), {
      message: "Invalid ObjectId format for eventId",
    }),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  });