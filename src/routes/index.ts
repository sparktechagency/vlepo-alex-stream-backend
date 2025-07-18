import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { EventRoutes } from '../app/modules/events/events.routes';
import { CategoriRoutes } from '../app/modules/categories/categories.routes';
import { FollowRoutes } from '../app/modules/follow/follow.routes';
import { RecentSearchRoutes } from '../app/modules/recentSearch/recentSearch.routes';
import { UserEventRoutes } from '../app/modules/userevents/userevents.routes';
import { FaqRoutes } from '../app/modules/FAQ/faq.routes';
import { PaymentRoutes } from '../app/modules/payment/payment.routes';
import { TicketRoutes } from '../app/modules/ticket/tickets.routes';
import { NotificationRoutes } from '../app/modules/notifications/notification.routes';
import { TermsAndConditionRoutes } from '../app/modules/FAQ/terms-and-condition.route';
import { DashboardRoutes } from '../app/modules/dashboard/dashboard.route';
import { PublicRoutes } from '../app/modules/public/public.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/follows',
    route: FollowRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/categories',
    route: CategoriRoutes,
  },
  {
    path: '/events',
    route: EventRoutes,
  },
  {
    path: '/user-events',
    route: UserEventRoutes,
  },
  {
    path: '/recent-search',
    route: RecentSearchRoutes,
  },
  {
    path: '/public',
    route: PublicRoutes,
  },
  {
    path: '/faqs',
    route: FaqRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/tickets',
    route: TicketRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/terms-and-condition',
    route: TermsAndConditionRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
