import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { categoriServices } from "./categories.services";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await categoriServices.createCategoryIntoDB(payload);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Create category successfully!',
        data: result,
    });
});

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await categoriServices.getAllCategoriesIntoDB();

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Retrived all category!',
        data: result,
    });
});


export const categoriController = {
    createCategory,
    getAllCategory,
}