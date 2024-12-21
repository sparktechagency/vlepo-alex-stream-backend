import express from 'express';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { USER_ROLE } from './user.constants';
const router = express.Router();

router.get(
  '/profile',
  auth(USER_ROLE.CREATOR, USER_ROLE.USER, USER_ROLE.SUPER_ADMIN),
  UserController.getUserProfile
);

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  )

  // .patch(
  //   auth(USER_ROLE.CREATOR, USER_ROLE.USER, USER_ROLE.SUPER_ADMIN),
  //   fileUploadHandler(),
  //   UserController.updateProfile
  // );

  router.patch("/favourite-category",
    validateRequest(UserValidation.updateFavouriteCategoryZodSchema),
    auth(USER_ROLE.USER),
    UserController.userFavouriteCategoryUpdate
  );

  router.patch("/save-event",
    validateRequest(UserValidation.saveEventZodSchema),
    auth(USER_ROLE.USER),
    UserController.savedUserEvents
  )

  router.delete("/delete-me",
    auth(USER_ROLE.USER, USER_ROLE.CREATOR), // TODO: CAN SUPER_ADMIN DELETE HIM?
    UserController.deleteCurrentUser
  )

  router.patch("/update-myprofile",
    auth(USER_ROLE.USER, USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN), // TODO: CAN SUPER_ADMIN DELETE HIM?
    UserController.updateMyProfile
  )


export const UserRoutes = router;
