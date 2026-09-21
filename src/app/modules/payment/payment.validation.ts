import { z } from "zod";

const createPaymentIntentZodSchema = z.object({

  bookingId: z.string(),
});

export const PaymentValidations = {
  createPaymentIntentZodSchema,
};
