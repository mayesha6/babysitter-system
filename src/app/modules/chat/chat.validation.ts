import { z } from "zod";

const sendMessageZodSchema = z.object({
  body: z.object({
    recipientId: z.string(),
    message: z.string().min(1),
  }),
});

export const ChatValidations = {
  sendMessageZodSchema,
};
