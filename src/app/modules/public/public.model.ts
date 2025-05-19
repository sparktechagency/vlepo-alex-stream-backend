import { Schema, model } from 'mongoose';
import {
  IPublic,
  IPublicInformation,
  PublicInformationModel,
  PublicModel,
} from './public.interface';

const publicSchema = new Schema<IPublic, PublicModel>(
  {
    content: { type: String },
    type: { type: String, enum: ['privacy-policy', 'terms-and-condition'] },
  },
  {
    timestamps: true,
  }
);

export const Public = model<IPublic, PublicModel>('Public', publicSchema);
