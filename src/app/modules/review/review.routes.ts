import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { ReviewControllers } from "./review.controller";
import { ReviewValidations } from "./review.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.PARENT),
  validateRequest(ReviewValidations.createReviewZodSchema),
  ReviewControllers.createReview
);

router.patch(
  "/:id",
  checkAuth(Role.PARENT),
  validateRequest(ReviewValidations.updateReviewZodSchema),
  ReviewControllers.updateReview
);

router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT),
  ReviewControllers.deleteReview
);

router.get(
  "/sitter/:sitterId",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  ReviewControllers.getReviewsForSitter
);

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  ReviewControllers.getAllReviews
);

export const ReviewRoutes = router;
