import Stripe from "stripe";
import { envVars } from "../config/env";

export const stripe = new Stripe(envVars.STRIPE?.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia" as any,
});
