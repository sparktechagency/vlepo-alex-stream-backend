import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { USER_ROLE } from './user.constants';
const router = express.Router();


router.post("/",
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser
);

router.post("/verify-register-email",
  auth(USER_ROLE.USER, USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
  validateRequest(UserValidation.verifyRegisterEmailZodSchema),
  UserController.verifyRegisterEmail
)

router.get(
  '/my-profile',
  auth(USER_ROLE.CREATOR, USER_ROLE.USER, USER_ROLE.SUPER_ADMIN),
  UserController.getUserProfile
);

router.get("/best-seller-creators",
  // auth(USER_ROLE.USER, USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
  UserController.bestSellerCreators
)

router.get(
  '/:creatorId',
  auth(USER_ROLE.CREATOR, USER_ROLE.USER, USER_ROLE.SUPER_ADMIN),
  UserController.getCreatorProfile
);

router.patch("/favourite-category",
  validateRequest(UserValidation.updateFavouriteCategoryZodSchema),
  auth(USER_ROLE.USER),
  UserController.userFavouriteCategoryUpdate
);


router.delete("/delete-me",
  auth(USER_ROLE.USER, USER_ROLE.CREATOR), // TODO: CAN SUPER_ADMIN DELETE HIM?
  UserController.deleteCurrentUser
)

router.patch("/update-myprofile",
  auth(USER_ROLE.USER, USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
  fileUploadHandler(),
  UserController.updateMyProfile
)

router.patch("/update-user-status/:userId",
  auth(USER_ROLE.SUPER_ADMIN),
  validateRequest(UserValidation.userChangeStatusZodSchema),
  UserController.updateUserStatus
)


router.patch("/switch-user-role",
  auth(USER_ROLE.USER, USER_ROLE.CREATOR),
  validateRequest(UserValidation.userRoleChangeZodSchema),
  UserController.toggleUserRole
);


export const UserRoutes = router;


// (req: Request, res: Response, next: NextFunction) => {
//   let photo = '';
//   if (req.files && 'image' in req.files && req.files.image[0]) {
//     photo = `/images/${req.files.image[0].filename}`;
//   }

//   const body = JSON.parse(req.body.data);
//   const formatedDataForZod = {
//     ...body,
//     photo
//   }
//   req.body = formatedDataForZod;
//   console.log(req.body)
//   next();
// },
// validateRequest(UserValidation.updateProfileZodSchema),