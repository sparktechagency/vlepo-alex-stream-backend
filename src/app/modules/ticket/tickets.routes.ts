import { Router } from "express";
import { TicketsController } from "./tickets.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();

router.get("/my-tickets",
    auth(USER_ROLE.USER),
    TicketsController.getSelfTickets
)

router.get("/:ticketId",
    auth(USER_ROLE.USER),
    TicketsController.getSingleTicket
)

export const TicketRoutes = router;