import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { FaqServices } from './faq.services';
import { Types } from 'mongoose';

const createFAQ = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqServices.createFAQintoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Create a new question!',
    data: result,
  });
});

const getAllFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqServices.getAllFaqFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Retrive all questions!',
    data: result,
  });
});

const updateSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const { faqId } = req.params;
  const result = await FaqServices.updateFaq(faqId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Updated single question!',
    data: result,
  });
});

const createOrUpdateTermsAndCondition = catchAsync(
  async (req: Request, res: Response) => {
    const result = await FaqServices.createOrUpdateTermsAndCondition(req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Create or update terms and condition!',
      data: result,
    });
  }
);

const getTermsAndCondition = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqServices.getTermsAndCondition();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Retrieved terms and condition!',
    data: result,
  });
});

const deleteFaQ = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqServices.deleteFaQ(new Types.ObjectId(req.params.id));
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Retrieved terms and condition!',
    data: result,
  });
});

export const FaqController = {
  createFAQ,
  getAllFaq,
  updateSingleCategory,
  createOrUpdateTermsAndCondition,
  getTermsAndCondition,
  deleteFaQ,
};
