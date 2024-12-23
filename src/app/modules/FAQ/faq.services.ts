import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { Faq } from "./faq.model"
import { IFaq } from "./faq.interface";

const createFAQintoDB = async (payload: IFaq) => {
    const result = await Faq.create(payload);

    if (!result) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong!")
    }

    return result;
}

const getAllFaqFromDB = async () => {
    const FAQS = await Faq.find({ isPublished: true });
    return FAQS;
}

const updateFaq = async (id: string, payload: Partial<IFaq>) => {
    const result = await Faq.findByIdAndUpdate(id,
        payload,
        { new: true }
    );

    return result;
}


export const FaqServices = {
    createFAQintoDB,
    getAllFaqFromDB,
    updateFaq,
}