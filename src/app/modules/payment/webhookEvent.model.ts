import { Schema, model } from "mongoose";

const webhookEventSchema = new Schema(
  {
    eventId: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const WebhookEvent = model("WebhookEvent", webhookEventSchema);
