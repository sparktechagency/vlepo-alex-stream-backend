import { z } from 'zod';

const requestPayoutSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: 'Amount is required' })
      .min(1, 'Minimum payout amount is $1')
      .max(10000, 'Maximum payout amount is $10,000'),
    currency: z
      .string()
      .optional()
      .default('usd'),
    description: z
      .string()
      .max(200, 'Description should not exceed 200 characters')
      .optional(),
  }),
});

export const payoutValidationSchema = {
  requestPayoutSchema,
};