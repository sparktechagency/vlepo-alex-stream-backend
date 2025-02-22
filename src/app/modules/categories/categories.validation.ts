import { z } from 'zod';

const categoryCreateValidationSchema = z.object({
    body: z.object({
        categoryName: z.string().min(1, { message: 'Name is required' }),
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