import { z } from "zod";

const createReviewZodSchema = z.object({


  booking: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),


});

const updateReviewZodSchema = z.object({


  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),


});

export const ReviewValidations = {
  createReviewZodSchema,
  updateReviewZodSchema,
};
