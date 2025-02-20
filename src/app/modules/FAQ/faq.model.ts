import mongoose, { Schema } from "mongoose";
import { IFaq, ITermsAndCondition, TermsAndConditionModel } from "./faq.interface";

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

});

export const Faq = mongoose.model<IFaq>("Faq", faqSchema);



const termsAndConditionSchema = new Schema<ITermsAndCondition>({
    content: { type: String, required: true, minlength: 10 },
  
}, {
    timestamps: true
});

export const TermsAndCondition = mongoose.model<ITermsAndCondition, TermsAndConditionModel>(
    "TermsAndCondition",
    termsAndConditionSchema
);

