import { Router } from 'express';
import { paymentController } from './payment.controller';
import { paymentValidationSchema } from './payment.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post("/create-payment-intent",
    auth(USER_ROLE.USER),
    validateRequest(paymentValidationSchema.paymentIntentSchema),
    paymentController.createPaymentIntent
)


router.post("/verify-payment",
    auth(USER_ROLE.USER),
    validateRequest(paymentValidationSchema.paymentIntentIdValidation),
    paymentController.verifyPayment
)


router.get("/get-transaction-history",
    auth(USER_ROLE.USER, USER_ROLE.CREATOR),
    paymentController.getTransactionHistory
)

// Webhook endpoint (note: this is also handled in app.ts for raw body parsing)
router.post("/webhook",
    paymentController.webhooks
)

export const PaymentRoutes = router;