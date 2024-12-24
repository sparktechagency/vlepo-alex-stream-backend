import { Router } from "express"
import { paymentController } from "./payment.controller";
import { paymentValidationSchema } from "./payment.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.post("/create-payment-intent",
    validateRequest(paymentValidationSchema.paymentIntentSchema),
    paymentController.createPaymentIntent
)


router.post("/verify-payment",
    validateRequest(paymentValidationSchema.paymentIntentIdValidation),
    paymentController.verifyPayment
)


router.post("/check", paymentController.check);


export const PaymentRoutes = router;