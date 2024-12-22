import mongoose from "mongoose";
import { z } from "zod";
import { USER_EVENT_TYPE } from "./userevents.constant";

export const userEventValidationSchema = z.object({
  body: z.object({
    eventId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid eventId format",
    }),
    type: z.enum(Object.values(USER_EVENT_TYPE) as [string, ...string[]], {
      required_error: "Type is required",
      invalid_type_error: "Only 'SAVED' or 'HISTORY' is valid",
    }),
  })
});