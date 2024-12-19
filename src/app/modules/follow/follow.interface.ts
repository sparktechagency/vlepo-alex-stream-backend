import { Document, ObjectId } from "mongoose";

export interface IFollow extends Document {
    userId: ObjectId; // যে ইউজার ফলো করছে store user id
    followingId: ObjectId; // store creator id
  }