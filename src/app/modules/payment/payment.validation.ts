import { z } from "zod";

const createPaymentIntentZodSchema = z.object({
  body: z.object({
    bookingId: z.string(),
  }),
});

export const PaymentValidations = {
  createPaymentIntentZodSchema,
};
