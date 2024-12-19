import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { FollowServices } from "./follow.services";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const toggleFollow = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user; // logedin user id
    const { followingId } = req.params; // creator id
  
    const result = await FollowServices.toggleFollow(id, followingId);
  
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Following action success!',
      data: result,
    });
  });



  export const FollowsController = {
    toggleFollow,
    // updateProfile 
  };