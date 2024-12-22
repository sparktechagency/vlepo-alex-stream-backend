import mongoose, { Schema, model } from "mongoose";
import { EVENTS_STATUS, EVENTS_TYPE } from "./events.constants";
import { IEvent } from "./events.interface";

const eventSchema = new Schema<IEvent>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventName: { type: String, required: true, trim: true },
    image: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^(https?:\/\/[^\s]+)$/.test(v), // Validate URL
        message: (props: { value: string }) => `${props.value} is not a valid URL!`,
      },
    },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    eventType: {
      type: String,
      enum: Object.values(EVENTS_TYPE),
      required: true,
    },
    ticketPrice: { type: Number, min: 0, required: true },
    totalSeat: { type: Number, min: 1, required: true },
    views: { type: Number, default: 0, min: 0 },
    isTrending: { type: Boolean, default: false },
    soldSeat: { type: Number, default: 0, min: 0 }, // ticket sold
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    status: {
      type: String,
      enum: Object.values(EVENTS_STATUS),
      default: EVENTS_STATUS.UPCOMING,
    }, 
  },
  { timestamps: true }
);

eventSchema.index({ createdBy: 1 })

export const Event = model<IEvent>("Event", eventSchema);

