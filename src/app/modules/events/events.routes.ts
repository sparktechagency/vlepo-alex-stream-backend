import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();

router.get(
  '/',
  auth(USER_ROLE.CREATOR, USER_ROLE.USER),
  //getAllEvents  todo
);

router.get(
  '/:eventId',
  auth(USER_ROLE.CREATOR, USER_ROLE.USER),
  //getAllEvents  todo
);

router.post(
  '/',
  // validateRequest(),
  auth(USER_ROLE.CREATOR),
  //createEvents  todo
);

router.put(
  "/",
  auth(USER_ROLE.CREATOR),
  // validateRequest(),
  // updateEvent,
);

router.delete(
  "/",
  auth(USER_ROLE.CREATOR),
  // deleteEvent
)


export const EventRoutes = router;