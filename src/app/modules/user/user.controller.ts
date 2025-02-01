import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import config from '../../../config';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        'User created successfully, and we send a OTP on your mail for verify email.',
      data: result,
    });
  }
);

// const verifyRegisterEmail = catchAsync(async (req: Request, res: Response) => {
//   const { otp, email } = req.body;
//   const result = await UserService.verifyRegisterEmail(email, otp);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: 'Verified your account!',
//     data: result,
//   });
// });

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const getCreatorProfile = catchAsync(async (req: Request, res: Response) => {
  const { creatorId } = req.params;
  const result = await UserService.getCreatorProfileFromDB(creatorId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const userFavouriteCategoryUpdate = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.user;
    const { categoryId } = req.body;

    const result = await UserService.userFavouriteCategoryUpdate(
      id,
      categoryId
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Favourite category added successfully',
      data: result,
    });
  }
);

const deleteCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;

  const result = await UserService.deleteCurrentUser(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully!',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  let payload;
  if (req.body.data) {
    payload = JSON.parse(req?.body?.data);
  }

  let photo;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    photo = `/images/${req.files.image[0].filename}`;
  }

  const data = {
    photo,
    ...payload,
  };

  const result = await UserService.updateMyProfile(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await UserService.updateUserStatus(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile status updated successfully',
    data: result,
  });
});

const toggleUserRole = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.toggleUserRole(req.user, req.body);
  const { refreshToken } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.node_env === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User switch his role successfully',
    data: result,
  });
});

const bestSellerCreators = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.bestSellerCreators();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Retrived best seller successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  // verifyRegisterEmail,
  getUserProfile,
  userFavouriteCategoryUpdate,
  deleteCurrentUser,
  updateMyProfile,
  updateUserStatus,
  getCreatorProfile,
  toggleUserRole,
  bestSellerCreators,
};
