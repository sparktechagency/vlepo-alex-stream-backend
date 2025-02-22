import { Document, Types } from "mongoose";

export interface ICategory extends Document{
    categoryName: string;
    createdBy: Types.ObjectId;
    image: string;
}