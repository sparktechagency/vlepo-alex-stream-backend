import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

const formDataProcessing = () => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let payload;
        if (req.body.data) {
            payload = JSON.parse(req.body.data);
        }

        // only for image
        let photo;
        if (req.files && "image" in req.files && req.files.image[0]) {
            photo = `/images/${req.files.image[0].filename}`;
        }

        req.body = {
            ...payload, image: photo
        }

        next();
    })
}

export default formDataProcessing;