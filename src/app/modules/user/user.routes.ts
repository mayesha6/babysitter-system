import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { updateUserZodSchema } from "./user.validation";

const router = Router();

router.post("/register", UserControllers.createUser);
router.post(
  "/create", 
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  UserControllers.createUser
);
router.get(
  "/all-users",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  UserControllers.getAllUsers
);
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);
router.patch(
  "/update-my-profile",
  checkAuth(...Object.values(Role)),
  UserControllers.updateMyProfile
);

router.get(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  UserControllers.getSingleUser
);
router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  UserControllers.updateUser
);
router.delete(
  "/delete-own-profile",
  checkAuth(...Object.values(Role)),
  UserControllers.deleteOwnAccount
);

router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  UserControllers.deleteUserById
);
router.delete(
  "/",
  checkAuth(Role.SUPER_ADMIN),
  UserControllers.deleteAllUsers
);

export const UserRoutes = router;
