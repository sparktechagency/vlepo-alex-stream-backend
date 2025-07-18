import  { Schema, model } from "mongoose";
import { EVENTS_STATUS, EVENTS_TYPE } from "./events.constants";
import { IEvent } from "./events.interface";

const eventSchema = new Schema<IEvent>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventName: { type: String, required: true, trim: true },
    image: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^\/images\/[\w-]+\.(png|jpeg|jpg)$/i.test(v);
        },
        message: (props: { value: any; }) => `${props.value} is not a valid image path! Only .png, .jpeg, or .jpg files in '/images/' directory are allowed.`
      },
      required: true
    },
    ticketSecretCode: { type: String, required: true, default: Math.floor(100000 + Math.random() * 900000) },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    eventType: {
      type: String,
      enum: [EVENTS_TYPE.VIRTUAL, EVENTS_TYPE.OFFLINE],
      required: true,
    },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    ticketPrice: { type: Number, min: 0, required: true },
    totalSeat: { type: Number, min: 1, required: false },
    views: { type: Number, default: 0, min: 0 },
    isTrending: { type: Boolean, default: false },
    soldTicket: { type: Number, default: 0, min: 0 }, // ticket sold
    totalSale: { type: Number, default: 0, min: 0 },
    startTime: { type: Date, required: [true, "Start time will be a date."] },
    endTime: { type: Date, required: false },
    status: {
      type: String,
      enum: [EVENTS_STATUS.UPCOMING, EVENTS_STATUS.LIVE, EVENTS_STATUS.COMPLETED, EVENTS_STATUS.CANCELLED],
      default: EVENTS_STATUS.UPCOMING,
    },
  },
  { timestamps: true }
);

eventSchema.index({ createdBy: 1 })

export const Event = model<IEvent>("Event", eventSchema);

