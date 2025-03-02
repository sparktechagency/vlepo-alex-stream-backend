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
import { JwtPayload } from 'jsonwebtoken';
const stripe = new Stripe(config.stripe_secret_key as string);


const createPaymentIntent = async (auth:JwtPayload,payload: IPaymentIntent) => {
    const {  eventId } = payload;

    // check already have any ticket for same event also same user
    const existSameTicket = await TicketModel.find({
        createdBy: auth.id,
        eventId: eventId,
        status: "confirmed",
    });


    if (existSameTicket.length >0) {
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

    const user = await User.isUserPermission(auth.id);

    if (user.role !== USER_ROLE.USER) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Only user can booked ticket.")
    }



    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Ticket',
                    },
                    unit_amount: Number(isEvent.ticketPrice) * 100,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        metadata: {
            userId: auth.id,
            eventId: eventId,
        },
    });
    await Payment.create([{ userId: auth.id, eventId: eventId, amount: Number(isEvent.ticketPrice), transactionId:Date.now().toString(), paymentStatus: PAYMENT_STATUS.PENDING, paymentMethod: "Card" }]);
    return { url: session.url };


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

        // const secretCode = Math.floor(100000 + Math.random() * 900000).toString();
        let secretCode = "";
        const existingTicket = await TicketModel.findOne({ eventId: eventId });
        if(!existingTicket){
        secretCode = Math.floor(100000 + Math.random() * 900000).toString();
        }

        secretCode = existingTicket?.secretCode as string;

        const newTicket = await TicketModel.create([{
            createdBy: userId,
            eventId: eventId,
            secretCode: secretCode,
    
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

const getTransactionHistory = async (user: JwtPayload) => {
    // Step 1: If the user is a creator, get all events created by the creator
    let payments;

    if (user.role === USER_ROLE.CREATOR) {
        // Fetch events created by the creator
        const events = await Event.find({ createdBy: user.id }).select('_id');

        // Extract the event IDs
        const eventIds = events.map(event => event._id);

        // Fetch payments for these events
        payments = await Payment.find({ eventId: { $in: eventIds } })
          .select('transactionId amount createdAt eventId userId')
          .populate<{ eventId: { title: string, createdBy: string } }>({
              path: 'eventId',
              select: 'title createdBy',
          })
          .populate<{ userId: { name: string, photo: string } }>({
              path: 'userId',
              select: 'name photo',
          })
          .sort({ createdAt: -1 });
    } else {
        // For normal users, just fetch payments where the user is the payer
        payments = await Payment.find({ userId: user.id })
          .select('transactionId amount createdAt eventId userId')
          .populate<{ eventId: { title: string, createdBy: string } }>({
              path: 'eventId',
              select: 'title createdBy',
          })
          .populate<{ userId: { name: string, photo: string } }>({
              path: 'userId',
              select: 'name photo',
          })
          .sort({ createdAt: -1 });
    }

    // Step 2: Process and map the payments
    const result = await Promise.all(
      payments.map(async payment => {
          // Check if the user is a creator, if so, fetch creator information for that event
          const creatorInfo = payment.eventId.createdBy
            ? await User.findById(payment.eventId.createdBy).select('name photo')
            : null;

          return {
              transactionId: payment.transactionId,
              amount: payment.amount,
              createdAt: payment.createdAt,
              eventName: payment.eventId.title,
              userName: payment.userId.name,
              profileImage: payment.userId.photo,
              creatorName: creatorInfo?.name || null, // Only return creator info if it's a creator's event
              creatorPhoto: creatorInfo?.photo || null,
          };
      })
    );

    return result;
};




export const paymentServices = {
    createPaymentIntent,
    verifyPayment,
    getTransactionHistory
}