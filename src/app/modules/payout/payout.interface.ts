import { Document, ObjectId } from 'mongoose';

export interface IPayout extends Document {
  creatorId: ObjectId;
  amount: number;
  stripePayoutId: string;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  currency: string;
  description?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayoutRequest {
  amount: number;
  currency?: string;
  description?: string;
}

export interface IStripeConnectAccount {
  accountId: string;
  onboardingUrl?: string;
  accountStatus: 'pending' | 'active' | 'restricted' | 'inactive';
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
}

export interface IConnectedAccountInfo {
  accountId: string;
  email: string;
  country: string;
  defaultCurrency: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  accountStatus: string;
  externalAccounts: {
    id: string;
    object: string;
    bank_name?: string;
    last4: string;
    routing_number?: string;
    account_holder_type?: string;
  }[];
}