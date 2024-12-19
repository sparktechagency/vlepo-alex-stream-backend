import { Document, ObjectId } from "mongoose";

export interface IFollow extends Document {
    userId: ObjectId; // যে ইউজার ফলো করছে
    followingId: ObjectId; // যাকে ফলো করা হচ্ছে
  }