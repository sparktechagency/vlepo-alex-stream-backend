import mongoose, { Document } from "mongoose";
import { TEventType } from "./userevents.constant";


export interface IUserEvent extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    eventId: mongoose.Schema.Types.ObjectId;
    type: TEventType;
}
