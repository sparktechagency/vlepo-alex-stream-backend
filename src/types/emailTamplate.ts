import { IEvent } from "../app/modules/events/events.interface";

export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};


export type TTicketSecret = {
  email: string,
  secretCode: string;
  event: IEvent;
}