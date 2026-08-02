import { Types } from "mongoose";

export enum BookingStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}

export interface IBooking {
  _id?: string;
  parent: Types.ObjectId | string;
  sitter: Types.ObjectId | string;
  jobPost?: Types.ObjectId | string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  totalHours: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
