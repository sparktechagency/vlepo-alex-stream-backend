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

export const UserRoutes = router;
