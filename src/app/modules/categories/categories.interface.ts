import { Document, ObjectId } from "mongoose";

export interface ICategory extends Document{
    categoryName: string;
    createdBy: ObjectId;
    image: string;
}