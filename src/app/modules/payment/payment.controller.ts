import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { paymentServices } from "./payment.services";

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
    const {email} = req.user;

    const result = await paymentServices.verifyPayment(paymentIntentId, email);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Payment verified!',
        data: result,
    });
})



export const paymentController = {
    createPaymentIntent,
    verifyPayment,
}