import { Types } from "mongoose";

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export interface IPayment {
  _id?: string;
  booking: Types.ObjectId | string;
  parent: Types.ObjectId | string;
  sitter: Types.ObjectId | string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  status: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
