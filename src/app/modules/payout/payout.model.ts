import { model, Schema } from 'mongoose';
import { IPayout } from './payout.interface';

const payoutSchema = new Schema<IPayout>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    stripePayoutId: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'canceled'],
      default: 'pending'
    },
    currency: {
      type: String,
      default: 'usd',
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    failureReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Index for efficient queries
payoutSchema.index({ creatorId: 1, createdAt: -1 });
payoutSchema.index({ stripePayoutId: 1 });
payoutSchema.index({ status: 1 });

export const Payout = model<IPayout>('Payout', payoutSchema);