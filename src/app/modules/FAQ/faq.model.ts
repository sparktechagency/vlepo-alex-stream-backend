import mongoose, { Schema } from "mongoose";
import { IFaq } from "./faq.interface";

const faqSchema = new Schema<IFaq>({
  question: {
    type: String,
    required: true,
    minlength: 5,
  },
  answer: {
    type: String,
    required: true,
    minlength: 10,
  },
  isPublished: {
    type: Boolean,
    required: true,
    default: true,
  }
});

export const Faq = mongoose.model<IFaq>("Faq", faqSchema);


