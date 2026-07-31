import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { SitterControllers } from "./sitter.controller";
import { createSitterProfileZodSchema, updateSitterProfileZodSchema } from "./sitter.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(createSitterProfileZodSchema),
  SitterControllers.createSitterProfile
);

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  SitterControllers.getAllSitterProfiles
);

router.get(
  "/:userId",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  SitterControllers.getSitterProfile
);

router.patch(
  "/:userId",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.BABYSITTER),
  validateRequest(updateSitterProfileZodSchema),
  SitterControllers.updateSitterProfile
);

router.delete(
  "/:userId",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  SitterControllers.deleteSitterProfile
);

export const SitterRoutes = router;
