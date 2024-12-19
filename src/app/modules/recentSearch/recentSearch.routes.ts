import { Router } from "express";
import { recentSearchController } from "./recentSearch.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();

router.post("/",
    auth(USER_ROLE.CREATOR, USER_ROLE.CREATOR, USER_ROLE.USER),
    recentSearchController.createRecentSearch,
)

router.get("/:userId",
    auth(USER_ROLE.CREATOR, USER_ROLE.CREATOR, USER_ROLE.USER),
    recentSearchController.getAllRecentSearchByUserId,
)

export const RecentSearchRoutes = router;