import { Router } from "express"
import { paymentController } from "./payment.controller";
import { paymentValidationSchema } from "./payment.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";

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


export const PaymentRoutes = router;