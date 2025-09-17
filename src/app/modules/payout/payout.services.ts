import Stripe from 'stripe';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { Payout } from './payout.model';
import { Payment } from '../payment/payment.model';
import { Event } from '../events/events.model';
import { IPayoutRequest, IStripeConnectAccount, IConnectedAccountInfo } from './payout.interface';
import { USER_ROLE } from '../user/user.constants';
import { PAYMENT_STATUS } from '../payment/payment.constant';
import { logger } from '../../../shared/logger';

const stripe = new Stripe(config.stripe_secret_key as string);

// Create Stripe Connect account for creator
const createConnectAccount = async (auth: JwtPayload): Promise<IStripeConnectAccount> => {
  const user = await User.isUserPermission(auth.id);
  
  if (user.role !== USER_ROLE.CREATOR) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only creators can create connect accounts');
  }

  if (user.stripeConnectAccountId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Connect account already exists');
  }

  try {
    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        email: user.email,
        first_name: user.name.split(' ')[0],
        last_name: user.name.split(' ').slice(1).join(' ') || user.name.split(' ')[0],
      },
    });

    // Update user with Stripe account ID
    await User.findByIdAndUpdate(auth.id, {
      stripeConnectAccountId: account.id,
      stripeConnectAccountStatus: 'pending'
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${config.client_url}/creator/connect/refresh`,
      return_url: `${config.client_url}/creator/connect/success`,
      type: 'account_onboarding',
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
      accountStatus: 'pending',
      payoutsEnabled: false,
      chargesEnabled: false
    };
  } catch (error: any) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to create connect account: ${error.message}`);
  }
};

// Get onboarding link for existing account
const getOnboardingLink = async (auth: JwtPayload): Promise<{ onboardingUrl: string }> => {
  const user = await User.isUserPermission(auth.id);
  
  if (user.role !== USER_ROLE.CREATOR) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only creators can access onboarding');
  }

  if (!user.stripeConnectAccountId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No connect account found. Please create one first.');
  }

  if (user.stripeOnboardingCompleted) {
    // If onboarding is completed, return Express dashboard login URL
    try {
      const loginLink = await stripe.accounts.createLoginLink(user.stripeConnectAccountId);
      return { onboardingUrl: loginLink.url };
    } catch (error: any) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to create dashboard login link: ${error.message}`);
    }
  }

  try {
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeConnectAccountId,
      refresh_url: `${config.client_url}/creator/connect/refresh`,
      return_url: `${config.client_url}/creator/connect/success`,
      type: 'account_onboarding',
    });

    return { onboardingUrl: accountLink.url };
  } catch (error: any) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to create onboarding link: ${error.message}`);
  }
};

// Get connected account information
const getConnectedAccountInfo = async (auth: JwtPayload): Promise<IConnectedAccountInfo> => {
  const user = await User.isUserPermission(auth.id);
  
  if (user.role !== USER_ROLE.CREATOR) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only creators can access account info');
  }

  if (!user.stripeConnectAccountId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No connect account found');
  }

  try {
    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);
    const externalAccounts = await stripe.accounts.listExternalAccounts(
      user.stripeConnectAccountId,
      { object: 'bank_account', limit: 10 }
    );

    return {
      accountId: account.id,
      email: account.email || user.email,
      country: account.country || 'US',
      defaultCurrency: account.default_currency || 'usd',
      payoutsEnabled: account.payouts_enabled || false,
      chargesEnabled: account.charges_enabled || false,
      accountStatus: account.details_submitted ? 'active' : 'pending',
      externalAccounts: externalAccounts.data.map((acc: any) => ({
        id: acc.id,
        object: acc.object,
        bank_name: acc.bank_name,
        last4: acc.last4,
        routing_number: acc.routing_number,
        account_holder_type: acc.account_holder_type
      }))
    };
  } catch (error: any) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to retrieve account info: ${error.message}`);
  }
};

// Calculate creator earnings (50% of ticket sales)
const getCreatorEarnings = async (auth: JwtPayload) => {
  const user = await User.isUserPermission(auth.id);
  
  if (user.role !== USER_ROLE.CREATOR) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only creators can view earnings');
  }

  // Get all events created by the creator
  const events = await Event.find({ createdBy: auth.id }).select('_id ticketPrice');
  const eventIds = events.map(event => event._id);

  // Get all successful payments for these events
  const payments = await Payment.find({
    eventId: { $in: eventIds },
    paymentStatus: PAYMENT_STATUS.PAID
  }).select('amount eventId');

  // Calculate total earnings (50% of each payment)
  const totalEarnings = payments.reduce((sum, payment) => sum + (payment.amount * 0.5), 0);

  // Get total payouts made
  const payouts = await Payout.find({
    creatorId: auth.id,
    status: { $in: ['paid', 'pending'] }
  }).select('amount status');

  const totalPayouts = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const pendingPayouts = payouts
    .filter(payout => payout.status === 'pending')
    .reduce((sum, payout) => sum + payout.amount, 0);

  const availableBalance = totalEarnings - totalPayouts;

  return {
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    totalPayouts: parseFloat(totalPayouts.toFixed(2)),
    pendingPayouts: parseFloat(pendingPayouts.toFixed(2)),
    availableBalance: parseFloat(availableBalance.toFixed(2)),
    currency: 'usd'
  };
};

// Request payout
const requestPayout = async (auth: JwtPayload, payload: IPayoutRequest) => {
  const user = await User.isUserPermission(auth.id);
  
  if (user.role !== USER_ROLE.CREATOR) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only creators can request payouts');
  }

  if (!user.stripeConnectAccountId || !user.stripeOnboardingCompleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Please complete Stripe Connect onboarding first');
  }

  if (!user.payoutsEnabled) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Payouts are not enabled for your account');
  }

  // Check available balance from creator earnings
  // const earnings = await getCreatorEarnings(auth);
  // if (payload.amount > earnings.availableBalance) {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, 'Insufficient balance for payout');
  // }

  if (payload.amount < 1) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Minimum payout amount is $1');
  }

  // Check admin account balance before transfer
  const adminBalance = await stripe.balance.retrieve();
  const availableBalance = adminBalance.available.find(b => b.currency === (payload.currency || 'usd'))?.amount || 0;
  
  if (payload.amount * 100 > availableBalance) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Insufficient funds in admin account for transfer');
  }

  // Calculate application fee (default 10% if not specified)
  // const applicationFeePercentage = payload.applicationFeePercentage || 0.10;
  // const applicationFeeAmount = Math.round(payload.amount * applicationFeePercentage * 100); // in cents
  // const transferAmount = Math.round(payload.amount * 100) - applicationFeeAmount; // Amount after fee
  const transferAmount = Math.round(payload.amount * 100); // Amount after fee

  try {
    // Generate idempotency key to prevent duplicate transfers
    const idempotencyKey = `payout_${auth.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check for existing pending payout to prevent duplicates
    const existingPayout = await Payout.findOne({
      creatorId: auth.id,
      status: { $in: ['processing', 'pending'] },
      amount: payload.amount
    });

    if (existingPayout) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'A payout request with the same amount is already being processed');
    }

    // Create transfer from admin account to creator's connected account
    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: payload.currency || 'usd',
      destination: user.stripeConnectAccountId,
      description: payload.description || 'Creator earnings payout',
      metadata: {
        creatorId: auth.id,
        payoutType: 'creator_earnings',
        originalAmount: payload.amount.toString(),
        // applicationFeeAmount: (applicationFeeAmount / 100).toString()
      }
    }, {
      idempotencyKey
    });

    // Save payout record with processing status
    const payoutRecord = await Payout.create({
      creatorId: auth.id,
      amount: payload.amount,
      stripePayoutId: transfer.id, // Store transfer ID for backward compatibility
      stripeTransferId: transfer.id,
      status: 'processing', // Will be updated to 'completed' by webhook
      currency: payload.currency || 'usd',
      description: payload.description || 'Creator earnings payout',
      // applicationFeeAmount: applicationFeeAmount / 100, // Store in dollars
      transferType: 'transfer'
    });

    return {
      payoutId: payoutRecord._id,
      stripeTransferId: transfer.id,
      amount: payload.amount,
      transferAmount: transferAmount / 100, // Amount received by creator
      // applicationFeeAmount: applicationFeeAmount / 100,
      currency: payload.currency || 'usd',
      status: 'processing', // Will be updated to 'completed' by webhook
      message: 'Transfer initiated successfully. Status will be updated once confirmed by Stripe.'
    };
  } catch (error: any) {
    // If transfer creation fails, update any created payout record to failed status
    try {
      const failedPayout = await Payout.findOne({
        creatorId: auth.id,
        status: 'processing',
        amount: payload.amount
      }).sort({ createdAt: -1 });
      
      if (failedPayout) {
        await Payout.findByIdAndUpdate(failedPayout._id, {
          status: 'failed',
          failureReason: error.message || 'Transfer creation failed'
        });
      }
    } catch (updateError) {
      logger.error('Error updating failed payout status:', updateError);
    }
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Transfer failed: ${error.message}`);
    } else if (error.type === 'StripeConnectionError') {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Payment service temporarily unavailable. Please try again.');
    } else {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to create transfer: ${error.message}`);
    }
  }
};

// Get payout history
const getPayoutHistory = async (auth: JwtPayload) => {
  const user = await User.isUserPermission(auth.id);
  
  if (user.role !== USER_ROLE.CREATOR) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only creators can view payout history');
  }

  const payouts = await Payout.find({ creatorId: auth.id })
    .sort({ createdAt: -1 })
    .select('amount stripePayoutId status currency description createdAt updatedAt failureReason');

  return payouts;
};

// Update account status (called by webhook)
const updateAccountStatus = async (accountId: string, accountData: any) => {
  const user = await User.findOne({ stripeConnectAccountId: accountId });
  
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User with this connect account not found');
  }

  const updateData: any = {
    payoutsEnabled: accountData.payouts_enabled || false,
    chargesEnabled: accountData.charges_enabled || false,
    stripeOnboardingCompleted: accountData.details_submitted || false
  };

  if (accountData.details_submitted) {
    updateData.stripeConnectAccountStatus = 'active';
  }

  await User.findByIdAndUpdate(user._id, updateData);
};

// Update payout status (called by webhook)
const updatePayoutStatus = async (stripePayoutId: string, status: string, failureReason?: string) => {
  try {
    const updateData: any = { status };
    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    await Payout.findOneAndUpdate(
      { stripePayoutId },
      updateData,
      { new: true }
    );
  } catch (error) {
    console.error('Error updating payout status:', error);
  }
};

// Update transfer status (for new transfer-based payouts)
const updateTransferStatus = async (stripeTransferId: string, status: string, failureReason?: string) => {
  try {
    const updateData: any = { status };
    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    await Payout.findOneAndUpdate(
      { stripeTransferId },
      updateData,
      { new: true }
    );
  } catch (error) {
    console.error('Error updating transfer status:', error);
  }
};

export const payoutServices = {
  createConnectAccount,
  getOnboardingLink,
  getConnectedAccountInfo,
  getCreatorEarnings,
  requestPayout,
  getPayoutHistory,
  updateAccountStatus,
  updatePayoutStatus,
  updateTransferStatus
};