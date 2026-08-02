import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { BookingControllers } from "./booking.controller";
import { BookingValidations } from "./booking.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.PARENT),
  validateRequest(BookingValidations.createBookingZodSchema),
  BookingControllers.createBooking
);

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  BookingControllers.getAllBookings
);

router.get(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  BookingControllers.getBookingById
);

router.patch(
  "/:id/status",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  validateRequest(BookingValidations.updateBookingStatusZodSchema),
  BookingControllers.updateBookingStatus
);

router.patch(
  "/:id/payment",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT),
  validateRequest(BookingValidations.updatePaymentStatusZodSchema),
  BookingControllers.updatePaymentStatus
);

export const BookingRoutes = router;
