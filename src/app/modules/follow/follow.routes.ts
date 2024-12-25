import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";
import { FollowsController } from "./follow.controler";
import validateRequest from "../../middlewares/validateRequest";
import { isFollowValidationSchema } from "./follow.validation";

const router = Router();

router.post("/toggle-follow/:followingId", // todo: followingId may be creator, not super_admin
    auth(USER_ROLE.USER),
    FollowsController.toggleFollow
)

router.get("/get-followers/:userId",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.CREATOR, USER_ROLE.USER),
    FollowsController.getFollowers
)

router.get("/get-following/:userId",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.CREATOR, USER_ROLE.USER),
    FollowsController.getFollowing
)

router.get("/isFollowing",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.CREATOR, USER_ROLE.USER),
    validateRequest(isFollowValidationSchema),
    FollowsController.isFollowing
)

export const FollowRoutes = router;