import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import expressSession from "express-session";
import passport from "passport";
import { envVars } from "./app/config/env";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";
import { PaymentControllers } from "./app/modules/payment/payment.controller";

const app = express()

app.post("/webhook", express.raw({ type: "application/json" }), PaymentControllers.stripeWebhook);


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://babysitter-frontend-seven.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isLocal = origin.includes("localhost") || origin.includes("127.0.0.1");
      const isVercel = origin.endsWith(".vercel.app");
      if (isLocal || isVercel || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Babysitter System Backend"
  })
})

app.use(notFound)

app.use(globalErrorHandler)

export default app