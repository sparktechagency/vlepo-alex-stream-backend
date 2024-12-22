import { z } from 'zod';

const categoryCreateValidationSchema = z.object({
    body: z.object({
        categoryName: z.string().min(1, { message: 'Name is required' }),
        userId: z.string({ required_error: "User ID is required" }).refine((id) => /^[a-f\d]{24}$/i.test(id), {
            message: "Invalid ObjectId for userId",
        }),
        image: z
            .string({ message: "Image must be a valid" })
            .regex(
                /^\/images\/([\w-]+\/)?[\w-]+\.(png|jpeg|jpg)$/i,
                { message: "Image path must start with '/images/' and end with .png, .jpeg, or .jpg" }
            )
    })
});

const categoryUpdateValidationSchema = z.object({
    body: z.object({
        categoryName: z.string().min(1, { message: 'Name is required' }).optional(),
        image: z
            .string()
            .regex(
                /^\/images\/([\w-]+\/)?[\w-]+\.(png|jpeg|jpg)$/i,
                { message: "Image path must start with '/images/' and end with .png, .jpeg, or .jpg" }
            ).optional()
    })
});


export const categoriesValidationSchema = {
    categoryCreateValidationSchema,
    categoryUpdateValidationSchema,
}