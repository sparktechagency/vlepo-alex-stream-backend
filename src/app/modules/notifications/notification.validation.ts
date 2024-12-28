import mongoose from "mongoose";
import { z } from "zod";

const notificationCreateValidationSchema = z.object({
    body: z.object({
        receiverId: z.string()
            .refine((id) => mongoose.Types.ObjectId.isValid(id), {
                message: "Invalid ObjectId",
            }),
        title: z.string().min(1, "Title is required"),
        message: z.string().min(1, "Message is required"),
        isRead: z.boolean().default(false),
    })
})


export const notificationValidation = {
    notificationCreateValidationSchema,
}