import { Document, ObjectId } from "mongoose";

export interface ICategory extends Document{
    categoryName: string;
    userId: ObjectId;
    image: string;
}