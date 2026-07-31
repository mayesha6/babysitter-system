import { Router, Request, Response } from "express";
import { upload, getFileUrl } from "../config/cloudinary.config";
import { sendResponse } from "../utils/sendResponse";
import httpStatus from "http-status-codes";

const router = Router();

router.post(
  "/",
  upload({ folder: "babysitter", maxCount: 10 }),
  (req: Request, res: Response) => {
    const files = req.files as any[];
    if (!files || files.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const urls = files.map((file) => getFileUrl(file));

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Files uploaded successfully to Cloudinary",
      data: urls,
    });
  }
);

export const UploadRoutes = router;
