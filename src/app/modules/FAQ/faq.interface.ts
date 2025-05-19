import { Document, Model, Types } from 'mongoose';

export interface IFaq extends Document {
  question: string;
  answer: string;
}

export interface ITermsAndCondition {
  _id: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TermsAndConditionModel = Model<ITermsAndCondition>;

export interface IContact extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContactModel = Model<IContact>;
