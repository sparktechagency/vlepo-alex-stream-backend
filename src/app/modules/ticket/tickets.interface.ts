import mongoose from "mongoose";

export interface ITicket extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId; 
  eventId: mongoose.Types.ObjectId;
  secretCode: string; 
  createdAt: Date;
  updatedAt: Date;
}