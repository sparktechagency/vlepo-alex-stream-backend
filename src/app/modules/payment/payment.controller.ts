import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { paymentServices } from "./payment.services";
import config from '../../../config';
import Stripe from 'stripe';
import { logger } from '../../../shared/logger';
import { Payment } from './payment.model';
import ApiError from '../../../errors/ApiError';
import { sendDataWithSocket } from '../../../helpers/socketHelper';
import { PAYMENT_STATUS } from './payment.constant';
import { TicketModel } from '../ticket/tickets.model';
import { Event } from '../events/events.model';
import { User } from "../user/user.model";
const createPaymentIntent = catchAsync(async (req, res) => {
    const result = await paymentServices.createPaymentIntent(req.user,req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Payment intent created!',
        data: result,
    });
})


const verifyPayment = catchAsync(async (req, res) => {
    const { paymentIntentId } = req.body;
    const {email} = req.user;

    const result = await paymentServices.verifyPayment(paymentIntentId, email);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Payment verified!',
        data: result,
    });
})

const getTransactionHistory = catchAsync(async (req, res) => {

    const result = await paymentServices.getTransactionHistory(req.user);

    sendResponse(res, {
        success: true,  
        statusCode: StatusCodes.OK,
        message: 'Transaction history retrieved!',
        data: result,
    });
})



const webhooks = catchAsync(async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = config.stripe_webhook_secret!;
    let event: Stripe.Event;

    try{
        event = Stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }catch (err){
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error(`Webhook signature verification failed: ${errorMessage}`); // Add detailed logging
        return res.status(400).send(`Webhook error: ${errorMessage}`);
    }

    const ticketSecret = Math.floor(100000 + Math.random() * 900000).toString();



    try{
        switch (event.type){
            case 'checkout.session.completed': {
                try {
                    // Get session data
                    const session = event.data.object as Stripe.Checkout.Session;
                    const userId = session?.metadata?.userId;
                    const eventId = session?.metadata?.eventId;
                    const transactionId = session?.payment_intent;

                    if (!userId || !eventId) {
                        throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing userId or eventId in metadata');
                    }

                    const existingEvent = await Event.findById(eventId).select('ticketSecretCode');
                    if (!existingEvent) {
                        throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
                    }


                    const ticket = {
                        createdBy: userId,
                        eventId: eventId,
                        secretCode: existingEvent.ticketSecretCode,
                        status: 'confirmed'
                    }

                    console.log(ticket)


                    // Run both updates in parallel to improve efficiency
                    const [updatedPayment,updatedUser, updateEvent, createdTicket] = await Promise.all([
                        Payment.findOneAndUpdate(
                          { userId, eventId },
                          { $set: { paymentStatus: PAYMENT_STATUS.PAID, transactionId } },
                          { new: true }
                        ),
                        User.findByIdAndUpdate(
                            userId,
                            { $addToSet: { favoriteEvents: eventId } },
                            { new: true }
                        ),

                         Event.findByIdAndUpdate(
                          eventId,
                          { $addToSet: { participants: userId, soldTicket: { $inc: 1 }, totalSale: { $inc: existingEvent.ticketPrice } } },
                          { new: true }
                        ),
                         TicketModel.create([ticket])
                    ]);

                    if(!updatedUser){
                        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update user');
                    }
                    // Check if updates were successful
                    if (!updatedPayment) {
                        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update payment status');
                    }
                    // if (!updatedTicket) {
                    //     throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update ticket status');
                    // }
                    if(!createdTicket){
                        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create ticket');
                    }
                    if(!updateEvent){
                        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update event');
                    }

                    // Send data with socket.io only if updates succeed
                    await sendDataWithSocket('payment', userId, {
                        title: 'Payment successful',
                        message: 'Your payment was successful',
                        type: 'success',
                    });
                } catch  {
                    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error processing payment');
                }
                break;
            }


            case 'payment_intent.payment_failed': {
                try {
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    const userId = paymentIntent?.metadata?.userId;
                    const eventId = paymentIntent?.metadata?.eventId;

                    if (!userId || !eventId) {
                        throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing userId or eventId in metadata');
                    }

                    // Run both operations in parallel
                    const [updatedPayment, deletedTicket] = await Promise.all([
                        Payment.findOneAndUpdate(
                          { userId, eventId },
                          { $set: { paymentStatus: PAYMENT_STATUS.FAILED } },
                          { new: true }
                        ),
                        TicketModel.findOneAndDelete({ createdBy: userId, eventId })
                    ]);

                    // Ensure payment update was successful
                    if (!updatedPayment) {
                        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update payment status');
                    }
                    if(!deletedTicket){
                        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete ticket');
                    }


                } catch {
                    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error processing failed payment');
                }
                break;
            }

            default: {
                logger.warn(`Unhandled event type: ${event.type}`);
            }
        }
    }catch (err){
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error(`Error handling event: ${errorMessage}`);
        return res.status(500).send(`Server error: ${errorMessage}`);
    }
    res.status(200).send('Received');
})


export const paymentController = {
    createPaymentIntent,
    verifyPayment,
    getTransactionHistory,
    webhooks
    }