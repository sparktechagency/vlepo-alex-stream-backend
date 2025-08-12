import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { payoutServices } from './payout.services';

// Create Stripe Connect account
const createConnectAccount = catchAsync(async (req, res) => {
  const result = await payoutServices.createConnectAccount(req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Connect account created successfully!',
    data: result,
  });
});

// Get onboarding link
const getOnboardingLink = catchAsync(async (req, res) => {
  const result = await payoutServices.getOnboardingLink(req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Onboarding link generated successfully!',
    data: result,
  });
});

// Get connected account information
const getConnectedAccountInfo = catchAsync(async (req, res) => {
  const result = await payoutServices.getConnectedAccountInfo(req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Account information retrieved successfully!',
    data: result,
  });
});

// Get creator earnings
const getCreatorEarnings = catchAsync(async (req, res) => {
  const result = await payoutServices.getCreatorEarnings(req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Earnings retrieved successfully!',
    data: result,
  });
});

// Request payout
const requestPayout = catchAsync(async (req, res) => {
  const result = await payoutServices.requestPayout(req.user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Payout requested successfully!',
    data: result,
  });
});

// Get payout history
const getPayoutHistory = catchAsync(async (req, res) => {
  const result = await payoutServices.getPayoutHistory(req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Payout history retrieved successfully!',
    data: result,
  });
});

export const payoutController = {
  createConnectAccount,
  getOnboardingLink,
  getConnectedAccountInfo,
  getCreatorEarnings,
  requestPayout,
  getPayoutHistory,
};