import { z } from "zod";
import { BookingStatus, PaymentStatus } from "./booking.interface";

const createBookingZodSchema = z.object({

  sitter: z.string(),
  jobPost: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  hourlyRate: z.number().nonnegative(),
  totalHours: z.number().positive(),
  additionalInfo: z.string().optional(),

});

const updateBookingStatusZodSchema = z.object({

  status: z.nativeEnum(BookingStatus)

});

const updatePaymentStatusZodSchema = z.object({

  paymentStatus: z.nativeEnum(PaymentStatus),

});

export const BookingValidations = {
  createBookingZodSchema,
  updateBookingStatusZodSchema,
  updatePaymentStatusZodSchema,
};
