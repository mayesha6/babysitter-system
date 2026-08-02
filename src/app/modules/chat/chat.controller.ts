import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ChatServices } from "./chat.services";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const senderId = (req.user as any).userId;
  const { recipientId, message } = req.body;
  const result = await ChatServices.sendMessage(senderId, recipientId, message);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result,
  });
});

const getConversations = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any).userId;
  const result = await ChatServices.getConversations(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversations retrieved successfully",
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any).userId;
  const { conversationId } = req.params;
  const result = await ChatServices.getMessages(userId, conversationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully",
    data: result,
  });
});

export const ChatControllers = {
  sendMessage,
  getConversations,
  getMessages,
};
