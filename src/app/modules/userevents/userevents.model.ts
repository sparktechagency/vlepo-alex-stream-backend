import mongoose, { model } from "mongoose";
import { IUserEvent } from "./userevents.interface";
import { USER_EVENT_TYPE } from "./userevents.constant";

const userEventSchema = new mongoose.Schema<IUserEvent>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        type: {
            type: String,
            enum: [USER_EVENT_TYPE.SAVED, USER_EVENT_TYPE.HISTORY],
            required: true,
        }
    },
    { timestamps: true }
);

userEventSchema.index({ type: 1, userId: 1 });

export const UserEvent = model<IUserEvent>("UserEvent", userEventSchema);