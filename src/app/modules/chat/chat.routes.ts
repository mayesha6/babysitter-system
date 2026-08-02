import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { ChatControllers } from "./chat.controller";
import { ChatValidations } from "./chat.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  validateRequest(ChatValidations.sendMessageZodSchema),
  ChatControllers.sendMessage
);

router.get(
  "/conversations",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  ChatControllers.getConversations
);

router.get(
  "/messages/:conversationId",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  ChatControllers.getMessages
);

export const ChatRoutes = router;
