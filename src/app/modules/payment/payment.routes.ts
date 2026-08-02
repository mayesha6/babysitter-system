import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { PaymentControllers } from "./payment.controller";
import { PaymentValidations } from "./payment.validation";

const router = Router();

router.post(
  "/create-intent",
  checkAuth(Role.PARENT),
  validateRequest(PaymentValidations.createPaymentIntentZodSchema),
  PaymentControllers.createPaymentIntent
);

router.get(
  "/history",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  PaymentControllers.getMyPaymentHistory
);

export const PaymentRoutes = router;
