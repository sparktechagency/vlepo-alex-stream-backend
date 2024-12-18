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
);

router.get("/single-event/:eventId",
    eventController.getSingleEventByEventId
);

router.get("/user-events/:creatorId",
    eventController.getAllEventsOfCreator
)

router.get("/",
    auth(USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN, USER_ROLE.USER),
    eventController.getAllEvents
);

router.get("/save-event",
    auth(USER_ROLE.USER),
    eventController.findSaveEvent
);




export const EventRoutes = router;