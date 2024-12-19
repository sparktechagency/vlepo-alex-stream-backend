import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";
import { FollowsController } from "./follow.controler";

const router = Router();

router.post("/toggle-follow/:followingId", // todo: followingId may be creator, not super_admin
    auth(USER_ROLE.USER),
    FollowsController.toggleFollow
)

router.get("/get-followers/:userId", 
    FollowsController.getFollowers
)

export const FollowRoutes = router;