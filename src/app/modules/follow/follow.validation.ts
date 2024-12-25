import { z } from "zod";

export const isFollowValidationSchema = z.object({
    body: z.object({
        userId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
            message: "userId must be a valid ObjectId", // Custom error message
        }),  // Validate userId as a valid ObjectId
        creatorId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
            message: "creatorId must be a valid ObjectId", // Custom error message
        }),  // Validate creatorId as a valid ObjectId
    })
});