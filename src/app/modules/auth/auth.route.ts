import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import { USER_ROLE } from '../user/user.constants';
const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser
);

router.post(
  '/change-password',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.USER, USER_ROLE.CREATOR),
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword
);

router.post(
  '/verify-email',
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);


router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken,
);

export const AuthRoutes = router;
