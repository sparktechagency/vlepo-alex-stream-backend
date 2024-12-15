import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";

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
  auth(USER_ROLES.ADMIN),
  // validateRequest(),
  // updateCategory,
);


export const CategoriRoutes = router;