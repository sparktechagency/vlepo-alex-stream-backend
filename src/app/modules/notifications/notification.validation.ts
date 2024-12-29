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
});

const sendNotificationToAllValidationSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        message: z.string({ required_error: "Message is required", invalid_type_error: "Message must be string."}),
        isRead: z.boolean().default(false),
    })
})


export const notificationValidation = {
    notificationCreateValidationSchema,
    sendNotificationToAllValidationSchema
}