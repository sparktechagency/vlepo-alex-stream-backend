import Stripe from "stripe";
import config from "../../../config";
import { IPaymentIntent } from "./payment.interface";
import { Payment } from "./payment.model";
import { TicketModel } from "../ticket/tickets.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { Event } from "../events/events.model";
import { User } from "../user/user.model";
import { PAYMENT_STATUS } from "./payment.constant";
import mongoose from "mongoose";
import { AttendanceModel } from "../events/attendanceSchema";
import { EVENTS_STATUS } from "../events/events.constants";
import { USER_ROLE } from "../user/user.constants";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import NotificationModel from "../notifications/notification.model";
import { formattedTime } from "../../../util/formattedTime";
const stripe = new Stripe(config.stripe_secret_key as string);


const createPaymentIntent = async (payload: IPaymentIntent) => {
    const { amount, eventId, userId } = payload;

    // check already have any ticket for same event also same user
    const existSameTicket = await TicketModel.find({
        createdBy: userId,
        eventId: eventId
    });

    if (existSameTicket.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Already you have a ticket.")
    }

    const isEvent = await Event.findOne({
        _id: eventId,
        status: EVENTS_STATUS.UPCOMING,
        startTime: { $gt: new Date() },
    });

    if (!isEvent) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No upcoming event found!");
    }

    const user = await User.isUserPermission(userId);
    if (user.role !== USER_ROLE.USER) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Only user can booked ticket.")
    }


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



const verifyPayment = async (paymentIntentId: string, userEmail: string) => {
    // @ts-ignore
    const io = global.io;
    const session = await mongoose.startSession();

    let paymentIntent;

    try {
        session.startTransaction();
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Payment not successfull!")
        }

        const userId = paymentIntent.metadata.userId;
        const eventId = paymentIntent.metadata.eventId;

        const newPayment = await Payment.create([{
            userId: userId,
            eventId: eventId,
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            paymentStatus: PAYMENT_STATUS.PAID,
            paymentMethod: "Card",
        }], { session });

        if (!newPayment.length) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create payment');
        }

        const secretCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newTicket = await TicketModel.create([{
            createdBy: userId,
            eventId: eventId,
            secretCode,
        }], { session });

        if (!newTicket.length) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create ticket');
        }

        const updateEvent = await Event.findOneAndUpdate(
            { _id: eventId, status: EVENTS_STATUS.UPCOMING },
            {
                $inc: {
                    soldTicket: 1,
                    totalSale: paymentIntent.amount / 100,
                },
            },
            { session, new: true }
        );

        if (!updateEvent) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Event not update")
        }

        const increaseAttendance = await AttendanceModel.create([{
            eventId,
            userId
        }], { session });

        if (!increaseAttendance.length) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Attencence not increase")
        }

        // send ticket secret code in email 
        const value = {
            secretCode,
            email: userEmail,
            event: updateEvent
        }

        const ticketTemplate = emailTemplate.ticketSecret(value);
        emailHelper.sendEmail(ticketTemplate);

        const notificationValue = {
            receiverId: userId,
            title: "Ticket Purchase Successful!",
            message: `Congratulations! You've successfully purchased a ticket for the event by payment ${paymentIntent.amount / 100}$. Visit your mail to view your secret code. Don't forget, the event will start at ${formattedTime(updateEvent.startTime)}. Enjoy the show!`,
            isRead: false
        }

        // create new notification 
        await NotificationModel.create([notificationValue], { session })

        // send notification 
        io.emit(`Purchase Successful notification::${userId.toString()}`, notificationValue);

        await session.commitTransaction();
        await session.endSession();

        return { PaymentStatus: paymentIntent.status }

    } catch (err: any) {
        await session.abortTransaction();
        await session.endSession();

        if (paymentIntent!.status === 'succeeded') {
            await stripe.refunds.create({
                payment_intent: paymentIntent!.id,
            });

            const notificationValue = {
                receiverId: paymentIntent?.metadata.userId,
                title: "Refund your money!",
                message: `Refund balance is ${paymentIntent!.amount / 100}$.`,
                isRead: false
            }
            // send notification 
            io.emit(`Refund notification::${paymentIntent?.metadata.userId.toString()}`, notificationValue);

            paymentIntent = "";
        }

        throw new Error(err);
    }
};

export const paymentServices = {
    createPaymentIntent,
    verifyPayment
}