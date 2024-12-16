import { z } from 'zod';

const categoryCreateValidationSchema = z.object({
    body: z.object({
        categoryName: z.string().min(1, { message: 'Name is required' }),
        image: z.string().url({ message: 'Image must be a valid URL' })
    })
});


export const categoriesValidationSchema = {
    categoryCreateValidationSchema,
}