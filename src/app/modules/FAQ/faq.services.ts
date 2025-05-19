import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Faq, TermsAndCondition } from './faq.model';
import { IFaq, IContact } from './faq.interface';
import { Types } from 'mongoose';

const createFAQintoDB = async (payload: IFaq) => {
  const result = await Faq.create(payload);

  if (!result) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong!'
    );
  }

  return result;
};

const getAllFaqFromDB = async () => {
  const FAQS = await Faq.find();
  return FAQS;
};

const updateFaq = async (id: string, payload: Partial<IFaq>) => {
  const result = await Faq.findByIdAndUpdate(id, payload, { new: true });

  return result;
};

const deleteFaQ = async (id: Types.ObjectId) => {
  const result = await Faq.findByIdAndDelete(id);
  return result;
};

const createOrUpdateTermsAndCondition = async (payload: Partial<IFaq>) => {
  const exist = await TermsAndCondition.findOne({});
  if (exist) {
    const result = await TermsAndCondition.findOneAndUpdate({}, payload);
    console.log(result);
    return 'Terms and conditions updated';
  }
  const result = await TermsAndCondition.create(payload);
  return 'Terms and conditions created';
};

const getTermsAndCondition = async () => {
  const result = await TermsAndCondition.find({});
  return result;
};

export const FaqServices = {
  createFAQintoDB,
  getAllFaqFromDB,
  updateFaq,
  createOrUpdateTermsAndCondition,
  getTermsAndCondition,
  deleteFaQ,
};
