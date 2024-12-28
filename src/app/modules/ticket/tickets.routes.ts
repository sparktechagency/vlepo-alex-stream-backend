import { Router } from "express";
import { TicketsController } from "./tickets.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();

router.get("/my-tickets",
    auth(USER_ROLE.USER),
    TicketsController.gerSelfTickets
)

export const TicketRoutes = router;