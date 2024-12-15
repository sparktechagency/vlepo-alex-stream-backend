import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const router = Router();

router.get(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLES.USER),
  //getAllEvents  todo
);

router.get(
  '/:eventId',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  //getAllEvents  todo
);

router.post(
  '/',
  // validateRequest(),
  auth(USER_ROLES.ADMIN),
  //createEvents  todo
);

router.put(
  "/",
  auth(USER_ROLES.ADMIN),
  // validateRequest(),
  // updateEvent,
);

router.delete(
  "/",
  auth(USER_ROLES.ADMIN),
  // deleteEvent
)


export const EventRoutes = router;