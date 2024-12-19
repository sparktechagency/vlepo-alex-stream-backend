import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { EventRoutes } from '../app/modules/events/events.routes';
import { CategoriRoutes } from '../app/modules/categories/categories.routes';
import { FollowRoutes } from '../app/modules/follow/follow.routes';
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
    path: '/events',
    route: EventRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
