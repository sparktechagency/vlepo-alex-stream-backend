import { Router } from "express";
import { NotificationController } from "./notification.controller";
import validateRequest from "../../middlewares/validateRequest";
import { notificationValidation } from "./notification.validation";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();

router.patch("/mark-read/:notificationId",
    NotificationController.markNotificationAsRead
);

router.post("/send-notification",
    validateRequest(notificationValidation.notificationCreateValidationSchema),
    NotificationController.sendNotificationToUser
)

router.post("/send-notification-to-all",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(notificationValidation.sendNotificationToAllValidationSchema),
    NotificationController.sendNotificationToAll
)

router.get("/self-notification",
    auth(USER_ROLE.USER, USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
    NotificationController.getAllNotificationOfReciver
)

router.delete("/",
    auth(USER_ROLE.USER, USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
    NotificationController.deleteAllMyNotification
)

export const NotificationRoutes = router;