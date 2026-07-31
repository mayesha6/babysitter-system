import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ParentServices } from "./parent.services";

const createParentProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await ParentServices.createParentProfile(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parent Profile created successfully",
    data: result,
  });
});

const getParentProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await ParentServices.getParentProfileByUserId(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parent Profile retrieved successfully",
    data: result,
  });
});

const getAllParentProfiles = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ParentServices.getAllParentProfiles(query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parent Profiles retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateParentProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await ParentServices.updateParentProfile(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parent Profile updated successfully",
    data: result,
  });
});

const deleteParentProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await ParentServices.deleteParentProfile(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parent Profile deleted successfully",
    data: result,
  });
});

export const ParentControllers = {
  createParentProfile,
  getParentProfile,
  getAllParentProfiles,
  updateParentProfile,
  deleteParentProfile,
};
