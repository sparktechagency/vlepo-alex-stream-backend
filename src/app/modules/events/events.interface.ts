import { Document, ObjectId } from "mongoose";
import { EVENTS_STATUS, EVENTS_TYPE } from "./events.constants";
import { IUser } from "../user/user.interface";

export interface IEvent extends Document {
  createdBy: ObjectId;
  eventName: string;
  image: string;
  description: string;
  categoryId: ObjectId;
  eventType: EVENTS_TYPE;
  ticketPrice: number;
  totalSeat: number;
  views?: number;
  isTrending?: boolean;
  soldTicket?: number;
  totalSale?: number;
  startTime: Date;
  endTime: Date;
  status: EVENTS_STATUS;
  participants: any;
  createdAt?: Date;
  updatedAt?: Date;
}
