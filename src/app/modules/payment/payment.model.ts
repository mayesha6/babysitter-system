import { Schema, model } from "mongoose";
import { IPayment, PaymentStatus } from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sitter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
