import { ICategory } from "./categories.interface";
import Category from "./categories.model";

const createCategoryIntoDB = async(payload: ICategory) => {
    const result = await Category.create(payload);

    return result;
}

const getAllCategoriesIntoDB = async() => {
    const categories = await Category.find();
    return categories;
}

export const categoriServices = {
    createCategoryIntoDB,
    getAllCategoriesIntoDB,
}