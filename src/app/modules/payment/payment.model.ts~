import { model, Schema } from "mongoose";
import { IPayment } from "./payment.interface";
import { PAYMENT_STATUS } from "./payment.constant";

const paymentSchema = new Schema<IPayment>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        transactionId: { type: String, unique: true, required: true },
        amount: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PAID, PAYMENT_STATUS.FAILED, PAYMENT_STATUS.REFUNDED],
            default: PAYMENT_STATUS.PENDING,
        },
        paymentMethod: { type: String, required: true }, // যেমন: "Card", "Bkash", "Paypal"
    },
    { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);