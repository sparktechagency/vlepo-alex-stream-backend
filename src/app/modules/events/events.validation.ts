import { z } from "zod";
import { EVENTS_STATUS, EVENTS_TYPE } from "./events.constants";

export const eventCreateValidationSchema = z.object({
  body:z.object({
    createdBy: z.string({ required_error: "User ID is required" }).refine((id) => /^[a-f\d]{24}$/i.test(id), {
      message: "Invalid ObjectId for userId",
    }),
    eventName: z.string({ required_error: "Event name is required" }).min(3, "Event name must be at least 3 characters long"),
    image: z.string({ required_error: "Image URL is required" }).url("Invalid image URL"),
    description: z.string({ required_error: "Description is required" }).min(10, "Description must be at least 10 characters long"),
    categoryId: z.string({ required_error: "Category ID is required" }).refine((id) => /^[a-f\d]{24}$/i.test(id), {
      message: "Invalid ObjectId for categoryId",
    }),
    eventType: z.enum([EVENTS_TYPE.VIRTUAL, EVENTS_TYPE.OFFLINE], { required_error: "Event type is required" }),
    ticketPrice: z.number({ required_error: "Ticket price is required" }).min(0, "Ticket price cannot be negative"),
    totalSeat: z.number({ required_error: "Total seat is required" }).min(1, "Total seat must be at least 1"),
    views: z.number().min(0, "Views cannot be negative").default(0),
    isTrending: z.boolean().optional(),
    soldSeat: z.number().min(0, "Sold seat cannot be negative").optional(),
    startTime: z.string({ required_error: "Start time is required" }).refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid start time format",
    }),
    endTime: z.string({ required_error: "End time is required" }).refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid end time format",
    }),
    attendees: z.array(z.string().refine((id) => /^[a-f\d]{24}$/i.test(id), { message: "Invalid ObjectId in attendees" })).optional(),
    status: z.enum([EVENTS_STATUS.UPCOMING, EVENTS_STATUS.LIVE, EVENTS_STATUS.COMPLETED, EVENTS_STATUS.CANCELLED]).optional(),
  })
});

export const validateEvent = (data: unknown) => eventCreateValidationSchema.parse(data);

export const eventValidationSchema={
  eventCreateValidationSchema
}