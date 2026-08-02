import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Conversation, Message } from "./chat.model";
import { io, getRecipientSocketId } from "../../utils/socket";
import { User } from "../user/user.model";

const sendMessage = async (senderId: string, recipientId: string, messageText: string) => {
  // Validate recipient
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new AppError(httpStatus.NOT_FOUND, "Recipient not found");
  }

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recipientId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, recipientId],
    });
  }

  // Save the message
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    message: messageText,
    isRead: false,
  });

  // Update conversation last message
  conversation.lastMessage = message._id;
  await conversation.save();

  // Populate sender data for the socket payload
  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name email");

  // Send real-time event via socket
  const recipientSocketId = getRecipientSocketId(recipientId);
  if (recipientSocketId && io) {
    io.to(recipientSocketId).emit("message_received", populatedMessage);
  }
  
  if (io) {
    // Also emit to the conversation room (for active chat views)
    io.to(conversation._id.toString()).emit("message_received", populatedMessage);
  }

  return populatedMessage;
};

const getConversations = async (userId: string) => {
  const result = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "name email phone role")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name email",
      },
    })
    .sort({ updatedAt: -1 });

  return result;
};

const getMessages = async (userId: string, conversationId: string) => {
  // Validate conversation exists and user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId
  );
  if (!isParticipant) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not a participant in this conversation");
  }

  // Mark other participant's messages in this conversation as read
  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: userId }, isRead: false },
    { isRead: true }
  );

  // Retrieve messages
  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });

  return messages;
};

export const ChatServices = {
  sendMessage,
  getConversations,
  getMessages,
};
