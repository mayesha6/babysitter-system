import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SitterServices } from "./sitter.services";

const createSitterProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await SitterServices.createSitterProfile(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Babysitter Profile created successfully",
    data: result,
  });
});

const getSitterProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await SitterServices.getSitterProfileByUserId(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Babysitter Profile retrieved successfully",
    data: result,
  });
});

const getAllSitterProfiles = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await SitterServices.getAllSitterProfiles(query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Babysitter Profiles retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateSitterProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await SitterServices.updateSitterProfile(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Babysitter Profile updated successfully",
    data: result,
  });
});

const deleteSitterProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await SitterServices.deleteSitterProfile(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Babysitter Profile deleted successfully",
    data: result,
  });
});

const verifySitterProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const adminId = (req.user as any).userId;
  const { status } = req.body;
  const result = await SitterServices.verifySitterProfile(userId, adminId, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Babysitter verification status updated successfully",
    data: result,
  });
});

export const SitterControllers = {
  createSitterProfile,
  getSitterProfile,
  getAllSitterProfiles,
  updateSitterProfile,
  deleteSitterProfile,
  verifySitterProfile,
};
