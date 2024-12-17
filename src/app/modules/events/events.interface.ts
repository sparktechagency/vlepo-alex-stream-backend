import { Document, ObjectId } from "mongoose";
import { EVENTS_STATUS, EVENTS_TYPE } from "./events.constants";

export interface IEvent extends Document {
  userId: ObjectId; 
  eventName: string; 
  image: string; 
  description: string; 
  categoryId: ObjectId; 
  eventType: EVENTS_TYPE; 
  ticketPrice: number; 
  totalSeat: number; 
  views: number; 
  isTrending: boolean; 
  soldSeat: number; 
  startTime: Date; 
  endTime: Date; 
  attendees: ObjectId[]; 
  status: EVENTS_STATUS; 
  createdAt?: Date; 
  updatedAt?: Date; 
}
