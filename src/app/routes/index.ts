import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { OtpRoutes } from "../modules/otp/otp.routes";
import { ParentRoutes } from "../modules/parent/parent.routes";
import { SitterRoutes } from "../modules/sitter/sitter.routes";
import { UploadRoutes } from "./upload.routes";
import { JobPostRoutes } from "../modules/jobPost/jobPost.routes";
import { BookingRoutes } from "../modules/booking/booking.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { NotificationRoutes } from "../modules/notification/notification.routes";
import { ChatRoutes } from "../modules/chat/chat.routes";

export const router = Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/otp",
        route: OtpRoutes
    },
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/parent-profile",
        route: ParentRoutes
    },
    {
        path: "/sitter-profile",
        route: SitterRoutes
    },
    {
        path: "/upload",
        route: UploadRoutes
    },
    {
        path: "/job-post",
        route: JobPostRoutes
    },
    {
        path: "/bookings",
        route: BookingRoutes
    },
    {
        path: "/reviews",
        route: ReviewRoutes
    },
    {
        path: "/payments",
        route: PaymentRoutes
    },
    {
        path: "/notifications",
        route: NotificationRoutes
    },
    {
        path: "/chats",
        route: ChatRoutes
    }
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
