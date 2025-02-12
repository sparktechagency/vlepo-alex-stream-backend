import { Document,  Types } from "mongoose";
import { EVENTS_STATUS, EVENTS_TYPE } from "./events.constants";
import { IUser } from "../user/user.interface";

export interface IEvent extends Document {
  [x: string]: any;
  createdBy: Types.ObjectId;
  eventName: string;
  image: string;
  description: string;
  categoryId: Types.ObjectId;
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
  upcomingEvents: number;
  pastEvents: number;
  createdAt?: Date;
  updatedAt?: Date;
}


export type IEventFilters = {
    searchTerm?: string;
    eventType?: EVENTS_TYPE;
    status?: EVENTS_STATUS;
}

