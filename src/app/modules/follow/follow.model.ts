import mongoose, { Schema, model } from "mongoose";
import { IFollow } from "./follow.interface";

const followSchema = new Schema<IFollow>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        followingId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export const Follow = model<IFollow>("Follow", followSchema);
