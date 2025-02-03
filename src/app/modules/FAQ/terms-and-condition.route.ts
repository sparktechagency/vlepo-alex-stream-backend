import express from "express";
import { FaqController } from "./faq.controller";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constants";
import auth from "../../middlewares/auth";
import { faqValidationSchema } from "./faq.validation";
const router = express.Router();

router.post("/",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(faqValidationSchema.termsAndConditionValidationSchema),
    FaqController.createOrUpdateTermsAndCondition
)

router.get("/",
    FaqController.getTermsAndCondition
)

export const TermsAndConditionRoutes = router;