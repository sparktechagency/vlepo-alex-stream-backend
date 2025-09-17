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
import { payoutServices } from '../payout/payout.services';
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

            // Stripe Connect account events
            case 'account.updated': {
                try {
                    const account = event.data.object as Stripe.Account;
                    await payoutServices.updateAccountStatus(account.id, account);
                    logger.info(`Account updated: ${account.id}`);
                } catch (error: any) {
                    logger.error(`Error updating account: ${error.message}`);
                }
                break;
            }

            // Payout events
            case 'payout.paid': {
                try {
                    const payout = event.data.object as Stripe.Payout;
                    await payoutServices.updatePayoutStatus(payout.id, 'paid');
                    logger.info(`Payout paid: ${payout.id}`);
                } catch (error: any) {
                    logger.error(`Error updating payout status: ${error.message}`);
                }
                break;
            }

            case 'payout.failed': {
                try {
                    const payout = event.data.object as Stripe.Payout;
                    await payoutServices.updatePayoutStatus(payout.id, 'failed', payout.failure_message || 'Payout failed');
                    logger.info(`Payout failed: ${payout.id}`);
                } catch (error: any) {
                    logger.error(`Error updating payout status: ${error.message}`);
                }
                break;
            }

            case 'payout.canceled': {
                try {
                    const payout = event.data.object as Stripe.Payout;
                    await payoutServices.updatePayoutStatus(payout.id, 'canceled');
                    logger.info(`Payout canceled: ${payout.id}`);
                } catch (error: any) {
                    logger.error(`Error updating payout status: ${error.message}`);
                }
                break;
            }

            // Transfer events (for new transfer-based payouts)
            case 'transfer.created': {
                try {
                    const transfer = event.data.object as Stripe.Transfer;
                    
                    // Update transfer status to completed when confirmed by Stripe
                    await payoutServices.updateTransferStatus(transfer.id, 'completed');
                    logger.info(`Transfer created and marked as completed: ${transfer.id}`);
                    
                    // Send notification to creator about successful transfer
                    if (transfer.metadata?.creatorId) {
                        // await sendDataWithSocket('payout', transfer.metadata.creatorId, {
                        //     title: 'Payout successful',
                        //     message: `Your payout of $${(transfer.amount / 100).toFixed(2)} has been completed and transferred to your account`,
                        //     type: 'success',
                        //     transferId: transfer.id
                        // });
                    }
                } catch (error: any) {
                    logger.error(`Error processing transfer created: ${error.message}`);
                }
                break;
            }

            case 'transfer.updated': {
                try {
                    const transfer = event.data.object as Stripe.Transfer;
                    // Handle any transfer updates if needed
                    logger.info(`Transfer updated: ${transfer.id}`);
                } catch (error: any) {
                    logger.error(`Error processing transfer updated: ${error.message}`);
                }
                break;
            }

            default: {
                // Handle transfer failures that might come through other event types
                if (event.type.includes('transfer') && event.data.object) {
                    const transfer = event.data.object as any;
                    
                    // Check if transfer has failed status or failure information
                    if (transfer.status === 'failed' || transfer.failure_code || transfer.failure_message) {
                        try {
                            await payoutServices.updateTransferStatus(
                                transfer.id, 
                                'failed', 
                                transfer.failure_message || transfer.failure_code || 'Transfer failed'
                            );
                            
                            logger.error(`Transfer failed: ${transfer.id} - ${transfer.failure_message || transfer.failure_code}`);
                            
                            // Send notification to creator about failed transfer
                            if (transfer.metadata?.creatorId) {
                                await sendDataWithSocket('payout', transfer.metadata.creatorId, {
                                    title: 'Payout failed',
                                    message: `Your payout failed: ${transfer.failure_message || transfer.failure_code || 'Unknown error'}. Please try again or contact support.`,
                                    type: 'error',
                                    transferId: transfer.id
                                });
                            }
                        } catch (error: any) {
                            logger.error(`Error processing transfer failure: ${error.message}`);
                        }
                    } else {
                        logger.warn(`Unhandled transfer event type: ${event.type}`);
                    }
                } else {
                    logger.warn(`Unhandled event type: ${event.type}`);
                }
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