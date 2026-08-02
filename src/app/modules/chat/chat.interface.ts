import { Types } from "mongoose";

export interface IConversation {
  _id?: string;
  participants: (Types.ObjectId | string)[];
  lastMessage?: Types.ObjectId | string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage {
  _id?: string;
  conversation: Types.ObjectId | string;
  sender: Types.ObjectId | string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
