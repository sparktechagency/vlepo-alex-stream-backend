import { Document, ObjectId } from 'mongoose';

export interface INotification extends Document {
    receiverId: ObjectId;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

