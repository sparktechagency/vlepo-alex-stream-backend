import catchAsync from '../../../shared/catchAsync';
import { DashboardService } from './dashboard.service';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import { Request, Response } from 'express';
import { userFilterableFields } from '../user/user.constants';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../types/pagination';
import { paymentFilterableFields } from '../payment/payment.constant';

const getTotalViewerCountWithGrowthRate = catchAsync(async(req: Request, res: Response) => {
  const  result = await DashboardService.getTotalViewerCountWithGrowthRate();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Total viewer count with growth rate retrieved successfully',
    data: result,
  });
});


const getUserEngagement = catchAsync(async(req: Request, res: Response) => {
  const {year} = req.params;
  const  result = await DashboardService.getUserEngagementData(year);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User engagement retrieved successfully',
    data: result,
  });

});


const getViewsAndCreatorCount = catchAsync(async(req: Request, res: Response) => {
  const {year} = req.params;
  const  result = await DashboardService.getViewsAndCreatorCount(year);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Viewers count retrieved successfully',
    data: result,
  });
});


const getEventStat=catchAsync(async(req: Request, res: Response) => {
  const {year} = req.params;
  const  result = await DashboardService.getEventStat(year);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event stat retrieved successfully',
    data: result,
  });
});

const getAllEvents = catchAsync(async(req: Request, res: Response) => {
  const  result = await DashboardService.getAllEvents();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All events retrieved successfully',
    data: result,
  });

});


const getAllPurchaseHistory = catchAsync(async(req: Request, res: Response) => {
  const filters = pick(req.query, paymentFilterableFields);
  const paginationOptions = pick(req.query, paginationFields
  );
  const  result = await DashboardService.getAllPurchaseHistory(filters,paginationOptions);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All purchase history retrieved successfully',
    pagination:result.meta,
    data: result.data,
  });

});

const getAllUsers = catchAsync(async(req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await DashboardService.getAllUsers(filters, paginationOptions);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All users retrieved successfully',
    pagination: result?.meta,
    data: result?.data,
  });
});



export const DashboardController = {
  getTotalViewerCountWithGrowthRate,
  getUserEngagement,
  getViewsAndCreatorCount,
  getEventStat,
  getAllEvents,
  getAllPurchaseHistory,
  getAllUsers
}