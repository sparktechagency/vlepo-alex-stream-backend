import { z } from "zod";


const faqCreateValidationSchema = z.object({
    body: z.object({
        question: z.string().min(5, "Question must be at least 5 characters long"),
        answer: z
            .string()
            .min(10, "Answer must be at least 10 characters long")
    })
});

const faqUpdateValidationSchema = z.object({
    body: z.object({
        question: z.string().min(5, "Question must be at least 5 characters long").optional(),
        answer: z
            .string()
            .min(10, "Answer must be at least 10 characters long")
            .optional(),
        isPublished: z
            .boolean()
            .optional()
    })
});

const termsAndConditionValidationSchema = z.object({
    body: z.object({
        content: z
            .string()
            .min(10, "Content must be at least 10 characters long")
    })
});

export const faqValidationSchema = {
    faqCreateValidationSchema,
    faqUpdateValidationSchema,
    termsAndConditionValidationSchema
}