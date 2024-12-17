import { z } from 'zod';

const categoryCreateValidationSchema = z.object({
    body: z.object({
        categoryName: z.string().min(1, { message: 'Name is required' }),
        image: z.string().url({ message: 'Image must be a valid URL' })
    })
});

const categoryUpdateValidationSchema = z.object({
    body: z.object({
        categoryName: z.string().min(1, { message: 'Name is required' }).optional(),
        image: z.string().url({ message: 'Image must be a valid URL' }).optional()
    })
});


export const categoriesValidationSchema = {
    categoryCreateValidationSchema,
    categoryUpdateValidationSchema,
}