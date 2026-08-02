import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ReviewServices } from "./review.services";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const parentId = (req.user as any).userId;
  const result = await ReviewServices.createReview(parentId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parentId = (req.user as any).userId;
  const result = await ReviewServices.updateReview(id, parentId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as any).userId;
  const role = (req.user as any).role;

  await ReviewServices.deleteReview(id, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});

const getReviewsForSitter = catchAsync(async (req: Request, res: Response) => {
  const { sitterId } = req.params;
  const result = await ReviewServices.getReviewsForSitter(sitterId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sitter reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.getAllReviews(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const ReviewControllers = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsForSitter,
  getAllReviews,
};
