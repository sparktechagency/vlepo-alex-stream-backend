import mongoose, { Schema, model } from "mongoose";
import { IFollow } from "./follow.interface";

const followSchema = new Schema<IFollow>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        followingId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

followSchema.index({ userId: 1 });
followSchema.index({ followingId: 1 });

export const Follow = model<IFollow>("Follow", followSchema);
