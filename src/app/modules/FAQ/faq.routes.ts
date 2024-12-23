import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";
import validateRequest from "../../middlewares/validateRequest";
import { faqValidationSchema } from "./faq.validation";
import { FaqController } from "./faq.controller";

const router = Router();

router.post("/",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(faqValidationSchema.faqCreateValidationSchema),
    FaqController.createFAQ
)

router.get("/",
    FaqController.getAllFaq,
);

router.patch("/:faqId",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(faqValidationSchema.faqUpdateValidationSchema),
    FaqController.updateSingleCategory
)

export const FaqRoutes = router;