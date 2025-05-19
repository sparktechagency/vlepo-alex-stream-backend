import express from 'express';
import { PublicController } from './public.controller';
import validateRequest from '../../middlewares/validateRequest';
import { PublicValidation } from './public.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(PublicValidation.create),
  PublicController.createPublic
);
router.get('/:type', PublicController.getAllPublics);

router.delete('/:id', PublicController.deletePublic);

router.post(
  '/contact',
  validateRequest(PublicValidation.contactZodSchema),
  PublicController.createContact
);

export const PublicRoutes = router;
