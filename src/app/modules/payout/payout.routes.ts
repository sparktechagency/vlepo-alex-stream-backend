import { Router } from 'express';
import { payoutController } from './payout.controller';
import { payoutValidationSchema } from './payout.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

// Create Stripe Connect account
router.post('/create-connect-account',
  auth(USER_ROLE.CREATOR),
  payoutController.createConnectAccount
);

// Get onboarding link
router.get('/onboarding-link',
  auth(USER_ROLE.CREATOR),
  payoutController.getOnboardingLink
);

// Get connected account information
router.get('/account-info',
  auth(USER_ROLE.CREATOR),
  payoutController.getConnectedAccountInfo
);

// Get creator earnings
router.get('/earnings',
  auth(USER_ROLE.CREATOR),
  payoutController.getCreatorEarnings
);

// Request payout
router.post('/request',
  auth(USER_ROLE.CREATOR),
  validateRequest(payoutValidationSchema.requestPayoutSchema),
  payoutController.requestPayout
);

// Get payout history
router.get('/history',
  auth(USER_ROLE.CREATOR),
  payoutController.getPayoutHistory
);

export const PayoutRoutes = router;