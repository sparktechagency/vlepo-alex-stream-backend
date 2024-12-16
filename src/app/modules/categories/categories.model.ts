import { model, Schema } from "mongoose";
import { ICategory } from "./categories.interface";

const categorySchema = new Schema<ICategory>({
    categoryName: { type: String, required: true, unique: true },
    image: { 
        type: String, 
        validate: {
            validator: function(v: string) {
                // URL Validation (checks if it's a valid URL)
                return /^(https?:\/\/[^\s]+)$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        },
        // default: "https://i.ibb.co/z5YHLV9/profile.png"
        required: true
    }
}, { timestamps: true });

const Category = model<ICategory>('Category', categorySchema);

export default Category;