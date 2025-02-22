import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { categoriServices } from "./categories.services";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const { id } = req.user;

    const result = await categoriServices.createCategoryIntoDB(payload, id);

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

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const result = await categoriServices.getSingleCategoryById(categoryId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Retrive single category!',
        data: result,
    });
})

const updateSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const result = await categoriServices.updateSingleCategoryById(categoryId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Updated single category!',
        data: result,
    });
})

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    const result = await categoriServices.deleteCategory(categoryId, req.user);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Successfully deleted category!',
        data: result,
    });
});


export const categoriController = {
    createCategory,
    getAllCategory,
    getSingleCategory,
    updateSingleCategory,
    deleteCategory,
}