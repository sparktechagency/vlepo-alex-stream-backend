import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import unlinkFile from '../../shared/unlinkFile';

const validateRequest =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync({
          body: req.body,
          params: req.params,
          query: req.query,
          cookies: req.cookies,
        });
        next();
      } catch (error) {
        if (req?.body?.image) {
          unlinkFile(req.body.image);
        }
        next(error);
      }
    };

export default validateRequest;
