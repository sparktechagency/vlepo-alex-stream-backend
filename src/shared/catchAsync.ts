import { NextFunction, Request, RequestHandler, Response } from 'express';
import unlinkFile from './unlinkFile';

const catchAsync =
  (fn: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(req.body)
      if(req.body.image){
        unlinkFile(req.body.image);  
      }
      next(error);
    }
  };

export default catchAsync;
