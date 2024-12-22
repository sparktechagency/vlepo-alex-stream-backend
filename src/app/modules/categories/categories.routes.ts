import { NextFunction, Request, Response, Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";
import validateRequest from "../../middlewares/validateRequest";
import { categoriesValidationSchema } from "./categories.validation";
import { categoriController } from "./categories.controller";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import formDataProcessing from "../../middlewares/formDataProcessing";

const router = Router();

router.post("/create",
    auth(USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
    fileUploadHandler(),
    formDataProcessing(),
    validateRequest(categoriesValidationSchema.categoryCreateValidationSchema),
    categoriController.createCategory
)

router.get("/",
    categoriController.getAllCategory
)

router.get("/:categoryId",
    auth(USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN, USER_ROLE.USER),
    categoriController.getSingleCategory
)

router.patch("/:categoryId",
    auth(USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
    fileUploadHandler(),
    formDataProcessing(),
    categoriController.updateSingleCategory
)

router.delete("/:categoryId",
    auth(USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
    categoriController.deleteCategory
)

export const CategoriRoutes = router;