import { Document, Model, Types } from "mongoose";

export interface IFaq extends Document {
    question: string;
    answer: string;
    isPublished: boolean;
}


export interface ITermsAndCondition {
    _id:Types.ObjectId
    content: string
    createdAt: Date
    updatedAt: Date
}

export type TermsAndConditionModel = Model<ITermsAndCondition>
