import { Router } from "express";
import { NotificationControllers } from "./notification.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  NotificationControllers.getMyNotifications
);

router.get(
  "/unread-count",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  NotificationControllers.getUnreadCount
);

router.patch(
  "/mark-all-read",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  NotificationControllers.markAllAsRead
);

router.patch(
  "/:id/read",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  NotificationControllers.markAsRead
);

export const NotificationRoutes = router;
