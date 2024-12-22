import mongoose, { model, Schema } from "mongoose";
import { ICategory } from "./categories.interface";

const categorySchema = new Schema<ICategory>({
    categoryName: { type: String, required: true, unique: true },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: {
        type: String,
        validate: {
            validator: function (v: string) {
                // Validate if the path starts with /images/ and ends with .png, .jpeg, or .jpg
                return /^\/images\/[\w-]+\.(png|jpeg|jpg)$/i.test(v);
            },
            message: props => `${props.value} is not a valid image path! Only .png, .jpeg, or .jpg files in '/images/' directory are allowed.`
        },
        // default: "https://i.ibb.co/z5YHLV9/profile.png"
        required: true
    }
}, { timestamps: true });

categorySchema.index({ userId: 1 });

const Category = model<ICategory>('Category', categorySchema);

export default Category;