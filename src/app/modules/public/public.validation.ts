import { z } from 'zod';

const contactZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    message: z.string({
      required_error: 'Message is required',
    }),
  }),
});

export const PublicValidation = {
  create: z.object({
    body: z.object({
      content: z.string(),
      type: z.enum(['privacy-policy', 'terms-and-condition']),
    }),
  }),

  update: z.object({
    body: z.object({
      content: z.string(),
      type: z.enum(['privacy-policy', 'terms-and-condition']),
    }),
  }),
  contactZodSchema,
};
