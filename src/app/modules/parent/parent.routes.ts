import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { ParentControllers } from "./parent.controller";
import { createParentProfileZodSchema, updateParentProfileZodSchema } from "./parent.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(createParentProfileZodSchema),
  ParentControllers.createParentProfile
);

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  ParentControllers.getAllParentProfiles
);

router.get(
  "/:userId",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  ParentControllers.getParentProfile
);

router.patch(
  "/:userId",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT),
  validateRequest(updateParentProfileZodSchema),
  ParentControllers.updateParentProfile
);

router.delete(
  "/:userId",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  ParentControllers.deleteParentProfile
);

export const ParentRoutes = router;
