import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ICategory } from "./categories.interface";
import Category from "./categories.model";
import mongoose from "mongoose";
import unlinkFile from "../../../shared/unlinkFile";
import { User } from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import { USER_ROLE } from "../user/user.constants";

const createCategoryIntoDB = async (payload: ICategory, id: string) => {


    if (!await User.isUserPermission(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User have no permission or not found")
    }

    const result = await Category.create({
        ...payload,
        createdBy: id
    });

    if (!result) {
        unlinkFile(payload.image);
    }

    return result;
}

const getAllCategoriesIntoDB = async () => {
    const categories = await Category.find();
    return categories;
}

const getSingleCategoryById = async (id: string) => {

    const category = await Category.findById(id); // todo: if no categoy find what is return? any error or null
    if(!category){
        throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!")
    }
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

const deleteCategory = async (categoryId: string, user: JwtPayload) => {
    
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "ObjectId is not valid!");
    }

    const category = await Category.findById(categoryId);

    if (!category) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Category not found!");
    }

    
    if (user.role === USER_ROLE.SUPER_ADMIN) {
        if (category.image) {
            unlinkFile(category.image); 
        }
        await Category.findByIdAndDelete(categoryId);
        return null;  // Success
    }

    
    if (category.createdBy.toString() !== user.id) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to delete this category!");
    }

    // if same creator create category or not super admin
    if (category?.image) {
        unlinkFile(category.image);  
    }

    
    await Category.findByIdAndDelete(categoryId);

    return null;  // Success
};

export const categoriServices = {
    createCategoryIntoDB,
    getAllCategoriesIntoDB,
    getSingleCategoryById,
    updateSingleCategoryById,
    deleteCategory,
}