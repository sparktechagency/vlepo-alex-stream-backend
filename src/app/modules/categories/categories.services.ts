import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ICategory } from "./categories.interface";
import Category from "./categories.model";
import mongoose from "mongoose";
import unlinkFile from "../../../shared/unlinkFile";
import { User } from "../user/user.model";

const createCategoryIntoDB = async (payload: ICategory, id: string) => {
    if (!await User.isUserPermission(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User have no permission or not found")
    }

    // todo: when category error for some resons but photo create
    const result = await Category.create({
        ...payload,
        userId: id
    });

    return result;
}

const getAllCategoriesIntoDB = async () => {
    const categories = await Category.find();
    return categories;
}

const getSingleCategoryById = async (id: string) => {

    const category = await Category.findById(id); // todo: if no categoy find what is return? any error or null
    return category;
}

const updateSingleCategoryById = async (id: string, payload: ICategory) => {
    const existCategory = await Category.findById(id);
    if (!existCategory) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Category not found!")
    }

    if (existCategory.image) {
        unlinkFile(existCategory?.image);
    }

    const category = await Category.findByIdAndUpdate(id,
        payload,
        { new: true }
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

    if (result.image) {
        unlinkFile(result.image)
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