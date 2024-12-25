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

const getFollowers = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const query = req.query;

    const result = await FollowServices.getFollowers(query, userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Followers retrived successfully!',
        data: result,
    });
});

const getFollowing = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const query = req.query;

    const result = await FollowServices.getFollowing(query, userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Following retrived successfully!',
        data: result,
    });
});


const isFollowing = catchAsync(async (req: Request, res: Response) => {

    const result = await FollowServices.isFollowing(req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Following',
        data: result,
    });
});


export const FollowsController = {
    toggleFollow,
    getFollowers,
    getFollowing,
    isFollowing,
};