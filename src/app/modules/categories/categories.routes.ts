import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";
import validateRequest from "../../middlewares/validateRequest";
import { categoriesValidationSchema } from "./categories.validation";
import { categoriController } from "./categories.controller";

const router = Router();

router.post("/create", 
    auth(USER_ROLE.CREATOR),
    validateRequest(categoriesValidationSchema.categoryCreateValidationSchema),
    categoriController.createCategory
)

router.get("/", 
    categoriController.getAllCategory
)

router.get("/:categoryId", 
    categoriController.getSingleCategory
)

router.delete("/:id", 
    auth(USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
    categoriController.deleteCategory
)

export const CategoriRoutes = router;