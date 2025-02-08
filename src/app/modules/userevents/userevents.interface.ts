import mongoose, { Document } from "mongoose";
import { TEventType } from "./userevents.constant";


export interface IUserEvent extends Document {
    userId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    type: TEventType;
}
