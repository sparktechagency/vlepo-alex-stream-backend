import mongoose from "mongoose";

export interface ITicket extends Document {
  _id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; 
  eventId: mongoose.Types.ObjectId;
  status: string;
  secretCode: string; 
  createdAt: Date;
  updatedAt: Date;
}