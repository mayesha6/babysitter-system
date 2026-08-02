import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { stripe } from "../../config/stripe";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentServices } from "./payment.services";
import { envVars } from "../../config/env";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any).userId;
  const { bookingId } = req.body;
  const result = await PaymentServices.createPaymentIntent(userId, bookingId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment intent created successfully",
    data: result,
  });
});

const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      envVars.STRIPE?.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(httpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
  }

  await PaymentServices.handleStripeWebhook(event);
  res.status(httpStatus.OK).json({ received: true });
};

const getMyPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any).userId;
  const role = (req.user as any).role;
  const result = await PaymentServices.getMyPaymentHistory(userId, role, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment history retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const PaymentControllers = {
  createPaymentIntent,
  stripeWebhook,
  getMyPaymentHistory,
};
