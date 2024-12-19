import { Document, ObjectId } from "mongoose";

export interface ISerarch extends Document {
    searchedAt: Date;
    query: string;
}

export interface IRecentSearch extends Document {
    userId: ObjectId,
    searches: ISerarch[],
}

