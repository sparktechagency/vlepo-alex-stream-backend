import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";
import validateRequest from "../../middlewares/validateRequest";
import { userEventValidationSchema } from "./userevents.validation";
import { UserEventController } from "./userevents.controller";

const router = Router();

router.post("/",
    auth(USER_ROLE.USER),
    validateRequest(userEventValidationSchema),
    UserEventController.createUserEvent
)

router.get("/",
    auth(USER_ROLE.USER),
    UserEventController.getEventsFilterByType
);

router.delete("/:userEventId",
    auth(USER_ROLE.USER),
    UserEventController.deleteUserEvent
);


export const UserEventRoutes = router;