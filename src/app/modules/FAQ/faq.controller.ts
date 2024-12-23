import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { FaqServices } from "./faq.services";


const createFAQ = catchAsync(async (req: Request, res: Response) => {
    const result = await FaqServices.createFAQintoDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Create a new question!',
        data: result,
    });
})


const getAllFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await FaqServices.getAllFaqFromDB();

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Retrive all questions!',
        data: result,
    });
})

const updateSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const { faqId } = req.params;
    const result = await FaqServices.updateFaq(faqId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Updated single question!',
        data: result,
    });
})



export const FaqController = {
    createFAQ,
    getAllFaq,
    updateSingleCategory,
}