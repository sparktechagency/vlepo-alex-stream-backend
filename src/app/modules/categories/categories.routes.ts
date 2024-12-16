import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();

router.get(
  '/',
  //getAllCategories  todo
);

router.post(
  '/',
  // validateRequest();
  //createCategory  todo
);

router.put(
  "/",
  auth(USER_ROLE.CREATOR),
  // validateRequest(),
  // updateCategory,
);


export const CategoriRoutes = router;