import express from 'express';
import { DashboardController } from './dashboard.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middlewares/auth';
const router = express.Router();

router.get('/total-viewer-count-with-growth-rate',
  auth(USER_ROLE.SUPER_ADMIN),
  DashboardController.getTotalViewerCountWithGrowthRate);

router.get('/user-engagement/:year',
  auth(USER_ROLE.SUPER_ADMIN),

  DashboardController.getUserEngagement
)

router.get('/views-and-creator-count/:year',
  auth(USER_ROLE.SUPER_ADMIN),
  DashboardController.getViewsAndCreatorCount
)


router.get('/event-stat/:year',
  auth(USER_ROLE.SUPER_ADMIN),
  DashboardController.getEventStat
)

router.get('/all-events',
  // auth(USER_ROLE.SUPER_ADMIN),
  DashboardController.getAllEvents
)

router.get('/all-purchases',
  // auth(USER_ROLE.SUPER_ADMIN),
  DashboardController.getAllPurchaseHistory
)

router.get('/all-users',
  // auth(USER_ROLE.SUPER_ADMIN),
  DashboardController.getAllUsers
)


export const DashboardRoutes = router;