import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { recentSearchServices } from "./recentSearch.services";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createRecentSearch = catchAsync(async (req: Request, res: Response) => {
    const { query } = req.body;
    const id = req?.user?.id || null;

    let result;
    if (id) {
        result = await recentSearchServices.createRecentSearch(query, id);
    } else {
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: '',
            data: null,
        });
    }


    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Recent search updated!',
        data: result,
    });
});

const getAllRecentSearchByUserId = catchAsync(async (req: Request, res: Response) => {
    const {userId} = req.params;

    const result = await recentSearchServices.getAllRecentSearchByUserId(userId);


    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Retrived recent search!',
        data: result,
    });
});


export const recentSearchController = {
    createRecentSearch,
    getAllRecentSearchByUserId
}