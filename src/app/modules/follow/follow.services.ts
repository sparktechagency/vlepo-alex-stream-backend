import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { Follow } from "./follow.model";
import { User } from "../user/user.model";
import { USER_ROLE } from "../user/user.constants";
import mongoose from "mongoose";
import { QueryBuilder } from "../../builder/QueryBuilder";

//followerId: req.user => who want to follow => req.user
const toggleFollow = async (followerId: string, creatorId: string) => {
    if (!followerId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not logedin.")
    }

    if (!mongoose.isValidObjectId(creatorId) || !mongoose.isValidObjectId(followerId)) {
        throw new Error("Invalid User or Creator ID");
    }


    if (followerId === creatorId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You can't follow your self.");
    }

    const creator = await User.isUserPermission(creatorId); // jake follow korte chai

    // todo: you can follow super_admin and creator. i am not sure
    if (creator.role === USER_ROLE.USER) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You can't follow another normal user.")
    }

    // check blocked, isDelete
    await User.isUserPermission(followerId);

    const alreadyFollowing = await Follow.findOne({ userId: followerId, followingId: creatorId });

    if (alreadyFollowing) {
        await Follow.findByIdAndDelete(alreadyFollowing._id);
        return null;
    }

    const follow = await Follow.create({ userId: followerId, followingId: creatorId });

    return follow;
}


const getFollowers = async (query: Record<string, unknown>, userId: string) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new Error("Invalid User or Creator ID!");
    }

    const followers = new QueryBuilder(Follow.find({ followingId: userId }), query)
        .paginate()
        .sort()
        .filter()

    const result = await followers.modelQuery
        .populate("userId", "name email photo")

    // total follower
    const followersCount = await Follow
        .countDocuments({ followingId: userId })

    const followersData = {
        followers: result,
        totalFollower: followersCount
    }

    return followersData;
};


const getFollowing = async (query: Record<string, unknown>, userId: string) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new Error("Invalid User or Creator ID!");
    }

    const followings = new QueryBuilder(Follow.find({ userId: userId }), query)
        .paginate()
        .sort()
        .filter()

    const result = await followings.modelQuery
        .populate("userId", "name email photo")

    // total follower
    const followingCount = await Follow
        .countDocuments({ userId })

    const followersData = {
        followings: result,
        totalFollowing: followingCount
    }

    return followersData;
};


const isFollowing = async (payload: { userId: string, creatorId: string }) => {
    const isFollowing = await Follow.findOne({
        userId: payload.userId,
        followingId: payload.creatorId
    })

    return isFollowing ? true : false;
}



export const FollowServices = {
    toggleFollow,
    getFollowers,
    getFollowing,
    isFollowing,
};