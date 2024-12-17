import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";
import { eventValidationSchema } from "./events.validation";
import { eventController } from "./events.controller";

const router = Router();

router.post("/create-events", 
    validateRequest(eventValidationSchema.eventCreateValidationSchema),
    auth(USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
    eventController.createEvents
)




export const EventRoutes = router;