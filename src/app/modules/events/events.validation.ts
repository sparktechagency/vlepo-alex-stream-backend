import { z } from "zod";
import { EVENTS_STATUS, EVENTS_TYPE } from "./events.constants";

export const eventCreateValidationSchema = z.object({
  body: z.object({
    eventName: z.string({ required_error: "Event name is required" }).min(3, "Event name must be at least 3 characters long"),
    image: z
      .string({ message: "Image must be a valid" })
      .regex(
        /^\/images\/([\w-]+\/)?[\w-]+\.(png|jpeg|jpg)$/i,
        { message: "Image path must start with '/images/' and end with .png, .jpeg, or .jpg" }
      ),
    description: z.string({ required_error: "Description is required" }).min(10, "Description must be at least 10 characters long"),
    categoryId: z.string({ required_error: "Category ID is required" }).refine((id) => /^[a-f\d]{24}$/i.test(id), {
      message: "Invalid ObjectId for categoryId",
    }),
    eventType: z.enum([EVENTS_TYPE.VIRTUAL, EVENTS_TYPE.OFFLINE], { required_error: "Event type is required" }),
    ticketPrice: z.number({ required_error: "Ticket price is required" }).min(0, "Ticket price cannot be negative"),
    startTime: z.string({ required_error: "Start time is required", invalid_type_error: "Start time will be date formate." }).refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid start time format",
    }),

    endTime: z.string({ required_error: "End time is required" }).refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid end time format",
    }).optional(),

    totalSeat: z.number({ required_error: "Total seat is required" }).min(1, "Total seat must be at least 1").optional(),

    views: z.number().min(0, "Views cannot be negative").default(0),
    isTrending: z.boolean().optional(),
    soldTicket: z.number().min(0, "Sold seat cannot be negative").optional(),

    status: z.enum([EVENTS_STATUS.UPCOMING, EVENTS_STATUS.LIVE, EVENTS_STATUS.COMPLETED, EVENTS_STATUS.CANCELLED]).default(EVENTS_STATUS.UPCOMING),
  })
});

export const validateEvent = (data: unknown) => eventCreateValidationSchema.parse(data);

export const eventValidationSchema = {
  eventCreateValidationSchema
}