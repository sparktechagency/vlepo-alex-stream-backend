import mongoose, { model, Schema } from "mongoose";
import { ITicket } from "./tickets.interface";

const TicketSchema = new Schema<ITicket>(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    status: {
      type: String,  // You can modify this to another type (e.g., Number, Boolean) if needed
      enum: ["pending", "confirmed", "cancelled"], // Example of possible status values
      required: true,
      default: "pending"
    },
    secretCode: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => /^[0-9]{6}$/.test(value),
        message: "Secret code must be exactly 6 digits",
      },
    },
  },
  { timestamps: true }
);



export const TicketModel = model<ITicket>("Ticket", TicketSchema);
