import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ICategory } from "./categories.interface";
import Category from "./categories.model";
import mongoose from "mongoose";

const createCategoryIntoDB = async (payload: ICategory) => {
    const result = await Category.create(payload);

    return result;
}

const getAllCategoriesIntoDB = async () => {
    const categories = await Category.find();
    return categories;
}

const getSingleCategoryById = async (id: string) => {
    const category = await Category.findById(id);
    return category;
}

const updateSingleCategoryById = async (id: string, payload: ICategory) => {
    console.log(payload);
    if(Object.keys(payload).length === 0){
        throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, "The provided info is empty and cannot be processed.");
    }

    const category = await Category.findByIdAndUpdate(id,
        payload,
        {new: true}
    );

    if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
    }

    return category;
}

const deleteCategory = async (id: string) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "ObjectId is not valid!");
    }

    const result = await Category.findByIdAndDelete(id);

    if (!result) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Category not found!");
    }

    return null;
}

export const categoriServices = {
    createCategoryIntoDB,
    getAllCategoriesIntoDB,
    getSingleCategoryById,
    updateSingleCategoryById,
    deleteCategory,
}