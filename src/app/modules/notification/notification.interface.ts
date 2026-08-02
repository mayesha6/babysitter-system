import { Types } from "mongoose";

export enum NotificationType {
  JOB_POST = "JOB_POST",
  BOOKING = "BOOKING",
  REVIEW = "REVIEW",
  SYSTEM = "SYSTEM",
}

export interface INotification {
  _id?: string;
  recipient: Types.ObjectId | string;
  sender?: Types.ObjectId | string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
