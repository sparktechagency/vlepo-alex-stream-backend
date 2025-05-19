import { z } from 'zod';

const faqCreateValidationSchema = z.object({
  body: z.object({
    question: z.string().min(5, 'Question must be at least 5 characters long'),
    answer: z.string().min(10, 'Answer must be at least 10 characters long'),
  }),
});

const faqUpdateValidationSchema = z.object({
  body: z.object({
    question: z
      .string()
      .min(5, 'Question must be at least 5 characters long')
      .optional(),
    answer: z
      .string()
      .min(10, 'Answer must be at least 10 characters long')
      .optional(),
  }),
});

const termsAndConditionValidationSchema = z.object({
  body: z.object({
    content: z.string().min(10, 'Content must be at least 10 characters long'),
  }),
});

const contactValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    message: z
      .string({
        required_error: 'Message is required',
      })
      .min(10, 'Message must be at least 10 characters long'),
  }),
});

export const faqValidationSchema = {
  faqCreateValidationSchema,
  faqUpdateValidationSchema,
  termsAndConditionValidationSchema,
  contactValidationSchema,
};
