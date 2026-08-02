import { Schema, model } from "mongoose";
import { IBooking, BookingStatus, PaymentStatus } from "./booking.interface";

const bookingSchema = new Schema<IBooking>(
  {
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
    jobPost: {
      type: Schema.Types.ObjectId,
      ref: "JobPost",
      required: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    totalHours: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    additionalInfo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Booking = model<IBooking>("Booking", bookingSchema);
