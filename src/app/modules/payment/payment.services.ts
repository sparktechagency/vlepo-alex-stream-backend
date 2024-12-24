import Stripe from "stripe";
import config from "../../../config";
import { IPaymentIntent } from "./payment.interface";
import { Payment } from "./payment.model";
import { TicketModel } from "../ticket/tickets.model";
const stripe = new Stripe(config.stripe_secret_key as string);

const createPaymentIntent = async (payload: IPaymentIntent) => {
    const { amount, eventId, userId } = payload;
    // check eventId and userId is have DB

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // সেন্টে রূপান্তর
        currency: "usd",
        payment_method_types: ['card'],
        metadata: { userId, eventId },
    });

    return { 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
    };
};



const verifyPayment = async (paymentIntentId: string) => {

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(paymentIntent);
    return paymentIntent;

    // if (paymentIntent.status === "succeeded") {
    //     // পেমেন্ট ডক তৈরি
    //     await Payment.create({
    //         userId: paymentIntent.metadata.userId,
    //         eventId: paymentIntent.metadata.eventId,
    //         transactionId: paymentIntent.id,
    //         amount: paymentIntent.amount / 100,
    //         paymentStatus: "PAID",
    //         paymentMethod: "Card",
    //     });

    //     // টিকেট ডক তৈরি
    //     const secretCode = Math.floor(100000 + Math.random() * 900000).toString();
    //     await TicketModel.create({
    //         createdBy: paymentIntent.metadata.userId,
    //         eventId: paymentIntent.metadata.eventId,
    //         secretCode,
    //     });

    //     return true;

    // } else {
    //     return "Payment not successful";
    // }
};



export const paymentServices = {
    createPaymentIntent,
    verifyPayment
}