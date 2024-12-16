import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ICategory } from "./categories.interface";
import Category from "./categories.model";
import mongoose from "mongoose";

const createCategoryIntoDB = async(payload: ICategory) => {
    const result = await Category.create(payload);

    return result;
}

const getAllCategoriesIntoDB = async() => {
    const categories = await Category.find();
    return categories;
}

const deleteCategory = async(id: string) => {   

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "ObjectId is not valid!");
    }

    const result = await Category.findByIdAndDelete(id);
    
    if(!result) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Category not found!");
    }

    return null;
}

export const categoriServices = {
    createCategoryIntoDB,
    getAllCategoriesIntoDB,
    deleteCategory,
}