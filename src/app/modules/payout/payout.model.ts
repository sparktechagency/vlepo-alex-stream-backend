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
    stripeTransferId: {
      type: String,
      unique: true,
      sparse: true
    },
    status: {
      type: String,
      enum: ['processing', 'pending', 'paid', 'failed', 'canceled', 'completed'],
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
    },
    applicationFeeAmount: {
      type: Number,
      default: 0
    },
    transferType: {
      type: String,
      enum: ['payout', 'transfer'],
      default: 'transfer'
    }
  },
  { timestamps: true }
);

// Index for efficient queries
payoutSchema.index({ creatorId: 1, createdAt: -1 });
payoutSchema.index({ stripePayoutId: 1 });
payoutSchema.index({ stripeTransferId: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ transferType: 1 });

export const Payout = model<IPayout>('Payout', payoutSchema);