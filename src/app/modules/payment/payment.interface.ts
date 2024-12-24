import { ObjectId } from "mongoose";
import { PAYMENT_STATUS } from "./payment.constant";

export interface IPayment extends Document {
    userId: ObjectId;
    eventId: ObjectId;
    transactionId: string;
    amount: number;
    paymentStatus: keyof typeof PAYMENT_STATUS;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPaymentIntent extends Document {
    userId: string;
    eventId: string;
    amount: number;
}