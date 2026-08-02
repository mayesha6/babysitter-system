import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { IPayment, PaymentStatus } from "./payment.interface";
import { Payment } from "./payment.model";
import { WebhookEvent } from "./webhookEvent.model";
import { stripe } from "../../config/stripe";
import { Booking } from "../booking/booking.model";
import { BookingStatus, PaymentStatus as BookingPaymentStatus } from "../booking/booking.interface";
import { QueryBuilder } from "../../utils/QueryBuiler";
import { Role } from "../user/user.interface";

const createPaymentIntent = async (userId: string, bookingId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  // Only the parent associated with this booking can pay
  if (booking.parent.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to make payment for this booking"
    );
  }

  // Ensure booking is accepted or completed
  if (
    booking.status !== BookingStatus.ACCEPTED &&
    booking.status !== BookingStatus.COMPLETED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot pay for booking with status ${booking.status}`
    );
  }

  // Ensure payment status is PENDING
  if (booking.paymentStatus !== BookingPaymentStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment has already been processed or initiated for this booking"
    );
  }

  // Call Stripe API to create PaymentIntent
  const amountInCents = Math.round(booking.totalAmount * 100);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      bookingId: booking._id.toString(),
      parentId: booking.parent.toString(),
      sitterId: booking.sitter.toString(),
    },
  });

  // Save pending transaction record
  const result = await Payment.create({
    booking: booking._id,
    parent: booking.parent,
    sitter: booking.sitter,
    amount: booking.totalAmount,
    currency: "usd",
    paymentIntentId: paymentIntent.id,
    status: PaymentStatus.PENDING,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    payment: result,
  };
};

const handleStripeWebhook = async (event: any) => {
  // Idempotency check
  const isEventProcessed = await WebhookEvent.findOne({ eventId: event.id });
  if (isEventProcessed) {
    console.log(`⚠️ Webhook event already processed: ${event.id}`);
    return;
  }

  const stripeObject = event.data.object;

  try {
    if (event.type === "payment_intent.succeeded") {
      const { bookingId } = stripeObject.metadata || {};

      if (bookingId) {
        // 1. Update Booking status to PAID
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: BookingPaymentStatus.PAID,
        });

        // 2. Update Payment transaction status to PAID
        await Payment.findOneAndUpdate(
          { paymentIntentId: stripeObject.id },
          { status: PaymentStatus.PAID }
        );
        
        console.log(`✅ Payment successful for Booking: ${bookingId}`);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      // Update Payment transaction status to FAILED
      await Payment.findOneAndUpdate(
        { paymentIntentId: stripeObject.id },
        { status: PaymentStatus.FAILED }
      );
      console.log(`❌ Payment failed for PaymentIntent: ${stripeObject.id}`);
    }

    // Save event to prevent duplicates
    await WebhookEvent.create({ eventId: event.id });
  } catch (error) {
    console.error("🔥 Stripe Webhook processing error:", error);
    throw error;
  }
};

const getMyPaymentHistory = async (
  userId: string,
  role: string,
  query: Record<string, any>
) => {
  const filterQuery: Record<string, any> = { ...query };

  // Role restriction
  if (role === Role.PARENT) {
    filterQuery.parent = userId;
  } else if (role === Role.BABYSITTER) {
    filterQuery.sitter = userId;
  }
  // Admin sees all

  const paymentQuery = new QueryBuilder(
    Payment.find()
      .populate("parent", "name email phone")
      .populate("sitter", "name email phone")
      .populate("booking"),
    filterQuery as Record<string, string>
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await paymentQuery.build();
  const meta = await paymentQuery.getMeta();

  return {
    data,
    meta,
  };
};

export const PaymentServices = {
  createPaymentIntent,
  handleStripeWebhook,
  getMyPaymentHistory,
};
