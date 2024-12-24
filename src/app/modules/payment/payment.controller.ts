import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { paymentServices } from "./payment.services";
import Stripe from "stripe";
import config from "../../../config";

const createPaymentIntent = catchAsync(async (req, res) => {

    const result = await paymentServices.createPaymentIntent(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Payment intent created!',
        data: result,
    });
})


const verifyPayment = catchAsync(async (req, res) => {
    const { paymentIntentId } = req.body;

    const result = await paymentServices.verifyPayment(paymentIntentId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Payment verified!',
        data: result,
    });
})

const stripe = new Stripe(config.stripe_secret_key as string);

const check = catchAsync(async (req, res) => {
    const { paymentIntentId } = req.body;  
    
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log({hi: paymentIntent.status})

        if (paymentIntent.status === "succeeded") {
            // পেমেন্ট সফল হলে, ডাটাবেসে পেমেন্ট ডক এবং টিকেট ডক তৈরি করুন
            // এখানে ডাটাবেস আপডেট করার লজিক থাকবে

            sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: 'Payment verified successfully!',
                data: {
                    paymentIntent
                },
            });
        } else {
            sendResponse(res, {
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message: 'Payment not successful',
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        sendResponse(res, {
            success: false,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Error verifying payment',
        });
    }
});


export const paymentController = {
    createPaymentIntent,
    verifyPayment,
    check,
}