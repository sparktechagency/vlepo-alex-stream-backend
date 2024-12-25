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

TicketSchema.index({ createdBy: 1, eventId: 1 }, { unique: true })

export const TicketModel = model<ITicket>("Ticket", TicketSchema);